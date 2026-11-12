import { LitElement, type TemplateResult, html, nothing, svg } from 'lit';
import {
	DEFAULTS,
	VIEWS,
	type Group,
	type PersonInfo,
	type HeatDay,
	type Row,
	addDays,
	addMonths,
	agenda,
	byList,
	collect,
	dateChange,
	firstWeekday,
	formatDay,
	formatTime,
	glance,
	heatmap,
	nest,
	overdue,
	parseTags,
	people,
	relativeDay,
	todayIn,
	week,
} from './data';
import './editor';
import { icons, styles } from './styles';
import type { Accounts, CardConfig, HomeAssistant, Item, PersonRef, Snapshot } from './types';

const PRIORITIES = ['None', 'Low', 'Medium', 'High'];

interface Draft {
	item: Item;
	title: string;
	day: string;
	time: string;
	priority: number;
	tags: string;
	notes: string;
	/** Ids of the assignees, when the task can be assigned from here; else null. */
	assignees: string[] | null;
	saving: boolean;
	error: string;
}

function icon(path: string): TemplateResult {
	return html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${path}></path>`}</svg>`;
}

function message(err: unknown): string {
	if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
	return String(err);
}

export class PeckListCard extends LitElement {
	static styles = styles;

	static properties = {
		_config: { state: true },
		_accounts: { state: true },
		_snapshots: { state: true },
		_problem: { state: true },
		_person: { state: true },
		_pending: { state: true },
		_draft: { state: true },
		_anchor: { state: true },
		_selected: { state: true },
		_filter: { state: true },
		_adding: { state: true },
		_addOpen: { state: true },
		_addError: { state: true },
		_today: { state: true },
	};

	declare _config: CardConfig;
	declare _accounts: Accounts | null;
	declare _snapshots: Map<string, Snapshot>;
	declare _problem: string;
	declare _person: string | null;
	declare _pending: Set<string>;
	declare _draft: Draft | null;
	declare _anchor: string | null;
	declare _selected: string | null;
	declare _filter: 'overdue' | 'today' | 'upcoming' | null;
	declare _adding: boolean;
	declare _addOpen: boolean;
	declare _addError: string;
	declare _today: string;

	private _hass?: HomeAssistant;
	private _unsubscribe: (() => void)[] = [];
	private _generation = 0;
	private _wanted = '';
	private _clock?: ReturnType<typeof setInterval>;

	constructor() {
		super();
		this._config = { type: 'custom:pecklist-card' };
		this._accounts = null;
		this._snapshots = new Map();
		this._problem = '';
		this._person = null;
		this._pending = new Set();
		this._draft = null;
		this._anchor = null;
		this._selected = null;
		this._filter = null;
		this._adding = false;
		this._addOpen = false;
		this._addError = '';
		this._today = todayIn(undefined);
	}

	// Home Assistant's card interface

	static getConfigElement(): HTMLElement {
		return document.createElement('pecklist-card-editor');
	}

	static getStubConfig(): CardConfig {
		return { type: 'custom:pecklist-card', view: 'glance', quick_add: true };
	}

	setConfig(config: CardConfig): void {
		if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
		if (config.view && !(VIEWS as readonly string[]).includes(config.view)) {
			throw new Error(`Unknown view "${config.view}": use ${VIEWS.join(', ')}`);
		}
		this.setAttribute('view', config.view ?? DEFAULTS.view);
		this._config = config;
		this.toggleAttribute('kiosk', !!config.kiosk);
		this.setAttribute('density', config.density ?? DEFAULTS.density);
		this.setAttribute('colors', config.colors ?? DEFAULTS.colors);
		this._filter = null;
		this._connect();
	}

	set hass(hass: HomeAssistant) {
		const first = !this._hass;
		this._hass = hass;
		const today = todayIn(hass.config?.time_zone);
		if (today !== this._today) this._today = today;
		if (first) this._connect();
	}

	getCardSize(): number {
		const view = this._config.view;
		return view === 'heatmap' ? 7 : view === 'tiles' ? 1 : view === 'next' ? 3 : 5;
	}

	getGridOptions(): Record<string, number> {
		const view = this._config.view;
		if (view === 'tiles') return { columns: 12, min_columns: 3, rows: 1, min_rows: 1 };
		if (view === 'next') return { columns: 12, min_columns: 6, rows: 3, min_rows: 2 };
		if (view === 'week') return { columns: 12, min_columns: 9, rows: 4, min_rows: 2 };
		return { columns: 12, min_columns: 6, rows: this._config.height ? Math.ceil(this._config.height / 56) + 1 : 6, min_rows: 3 };
	}

	connectedCallback(): void {
		super.connectedCallback();
		this._connect();
		// The day can roll over while a wall tablet shows the card.
		this._clock = setInterval(() => {
			const today = todayIn(this._hass?.config?.time_zone);
			if (today !== this._today) this._today = today;
		}, 60_000);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		clearInterval(this._clock);
		this._drop();
	}

	// Data

	private _drop(): void {
		this._generation++;
		this._wanted = '';
		for (const stop of this._unsubscribe) stop();
		this._unsubscribe = [];
	}

	/** Subscribe to the accounts the configuration names; again whenever that set changes. */
	private async _connect(): Promise<void> {
		const hass = this._hass;
		if (!hass || !this.isConnected) return;
		try {
			this._accounts ??= await hass.callWS<Accounts>({ type: 'pecklist/accounts' });
		} catch (err) {
			this._problem =
				(err as { code?: string })?.code === 'unknown_command'
					? 'The PeckList integration is not set up. Add it under Settings > Devices & services.'
					: `PeckList: ${message(err)}`;
			return;
		}
		const all = this._accounts.accounts;
		const named = (this._config.entries ?? []).filter((id) => all.some((a) => a.entry_id === id));
		const ids = named.length ? named : this._accounts.mine ? [this._accounts.mine] : all.map((a) => a.entry_id);
		const wanted = ids.join(',');
		if (wanted === this._wanted) return;
		this._drop();
		this._wanted = wanted;
		const generation = this._generation;
		this._problem = all.length ? '' : 'No PeckList account is connected. Add one under Settings > Devices & services.';
		this._snapshots = new Map([...this._snapshots].filter(([id]) => ids.includes(id)));
		for (const id of ids) {
			try {
				const stop = await hass.connection.subscribeMessage<Snapshot>(
					(snapshot) => {
						if (generation !== this._generation) return;
						this._snapshots = new Map(this._snapshots).set(id, snapshot);
						if (this._pending.size) this._pending = new Set();
					},
					{ type: 'pecklist/subscribe', entry_id: id },
				);
				if (generation === this._generation) this._unsubscribe.push(stop);
				else stop();
			} catch (err) {
				if (generation === this._generation) this._problem = `PeckList: ${message(err)}`;
			}
		}
	}

	private get _language(): string {
		return this._hass?.locale?.language ?? this._hass?.language ?? 'en';
	}

	private _shown(): Snapshot[] {
		return this._wanted
			.split(',')
			.map((id) => this._snapshots.get(id))
			.filter((s): s is Snapshot => !!s);
	}

	/** The people on this card, each with a name and a color. */
	private _people(): PersonInfo[] {
		const loaded = this._wanted.split(',').filter((id) => this._snapshots.has(id));
		return people(this._accounts?.accounts ?? [], loaded, this._config.person_colors);
	}

	private async _send(type: string, item: { entryId: string }, data: Record<string, unknown>): Promise<unknown> {
		if (!this._hass) throw new Error('Not connected');
		return this._hass.callWS({ type: `pecklist/task/${type}`, entry_id: item.entryId, ...data });
	}

	// Actions

	private async _toggle(item: Item): Promise<void> {
		if (!item.canWrite || this._pending.has(item.task.id)) return;
		this._pending = new Set(this._pending).add(item.task.id);
		try {
			await this._send(item.open ? 'complete' : 'reopen', item, { task_id: item.task.id });
		} catch (err) {
			this._pending = new Set([...this._pending].filter((id) => id !== item.task.id));
			this._problem = message(err);
			setTimeout(() => (this._problem = ''), 6000);
		}
	}

	private async _add(event: Event): Promise<void> {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const input = form.querySelector('input') as HTMLInputElement;
		const text = input.value.trim();
		const target = (form.querySelector('select') as HTMLSelectElement | null)?.value ?? this._addTargets()[0]?.value;
		if (!text || !target || this._adding) return;
		const [entryId, listId] = target.split('/');
		this._adding = true;
		this._addError = '';
		try {
			await this._send('quick_add', { entryId: entryId ?? '' }, { text, ...(listId ? { list_id: listId } : {}) });
			input.value = '';
		} catch (err) {
			this._addError = message(err);
		} finally {
			this._adding = false;
			input.focus();
		}
	}

	/** Where quick add can put a task: each shown person's default list and the lists they may change (only the card's own, when it names some). */
	private _addTargets(): { value: string; label: string }[] {
		const wanted = new Set(this._config.lists ?? []);
		const snapshots = this._shown().filter((s) => s.account.can_write && (!this._person || s.account.entry_id === this._person));
		const targets: { value: string; label: string }[] = [];
		for (const snapshot of snapshots) {
			const who = snapshots.length > 1 ? `${snapshot.account.username}: ` : '';
			const lists = snapshot.lists.filter((l) => (!wanted.size || wanted.has(l.id)) && (l.role === 'owner' || l.role === 'editor'));
			// "Default" is the account's own choice for new tasks, which falls back to its inbox. An
			// account that has never opened the app has no inbox yet, and the server would refuse.
			if (!wanted.size && snapshot.lists.some((l) => l.isInbox)) {
				targets.push({ value: `${snapshot.account.entry_id}/`, label: `${who}Default list` });
			}
			for (const list of lists) targets.push({ value: `${snapshot.account.entry_id}/${list.id}`, label: who + list.name });
		}
		return targets;
	}

	private _assist(): void {
		// Home Assistant handles this event from any card: it opens Assist, listening.
		this.dispatchEvent(
			new CustomEvent('hass-action', {
				bubbles: true,
				composed: true,
				detail: { config: { tap_action: { action: 'assist', start_listening: true } }, action: 'tap' },
			}),
		);
	}

	private _edit(item: Item): void {
		if (!item.canWrite) return;
		this._draft = {
			item,
			title: item.task.title,
			day: item.day ?? '',
			time: item.time ?? '',
			priority: item.task.priority,
			tags: item.task.tags.join(', '),
			notes: item.task.notes ?? '',
			assignees: item.list?.shared && this._assignable(item).length > 1 ? [...item.task.assignees] : null,
			saving: false,
			error: '',
		};
	}

	/** Who this task can be assigned to, through the account it is written with. */
	private _assignable(item: Item): PersonRef[] {
		return (this._snapshots.get(item.entryId)?.people ?? []).filter((p) => p.assignable);
	}

	private _set(change: Partial<Draft>): void {
		if (this._draft) this._draft = { ...this._draft, ...change };
	}

	private async _save(event: Event): Promise<void> {
		event.preventDefault();
		const draft = this._draft;
		if (!draft || draft.saving) return;
		const { task } = draft.item;
		// Only what changed, so an edit made meanwhile to another field survives.
		const changes: Record<string, unknown> = {};
		const title = draft.title.trim();
		if (!title) return this._set({ error: 'A task needs a title.' });
		if (title !== task.title) changes.title = title;
		if (draft.notes !== (task.notes ?? '')) changes.notes = draft.notes;
		if (draft.priority !== task.priority) changes.priority = draft.priority;
		const tags = parseTags(draft.tags);
		if (tags.join('\n') !== task.tags.join('\n')) changes.tags = tags;
		if (draft.assignees && [...draft.assignees].sort().join() !== [...task.assignees].sort().join()) changes.assignees = draft.assignees;
		const time = draft.day ? draft.time : '';
		if (draft.day !== (draft.item.day ?? '') || time !== (draft.item.time ?? '')) {
			Object.assign(changes, dateChange(task, draft.day || null, time || null));
		}
		if (!Object.keys(changes).length) {
			this._draft = null;
			return;
		}
		this._set({ saving: true, error: '' });
		try {
			await this._send('update', draft.item, { task_id: task.id, changes });
			this._draft = null;
		} catch (err) {
			this._set({ saving: false, error: message(err) });
		}
	}

	private async _delete(): Promise<void> {
		const draft = this._draft;
		if (!draft || draft.saving) return;
		this._set({ saving: true, error: '' });
		try {
			await this._send('delete', draft.item, { task_id: draft.item.task.id });
			this._draft = null;
		} catch (err) {
			this._set({ saving: false, error: message(err) });
		}
	}

	// Rendering

	protected render(): TemplateResult {
		const config = this._config;
		const view = config.view ?? DEFAULTS.view;
		const people = this._people();
		const snapshots = this._shown();
		const loading = !this._problem && !!this._wanted && this._snapshots.size === 0;
		const offline = snapshots.some((s) => !s.connected);
		// One person's button narrows everything below to their tasks.
		const person = people.some((p) => p.entryId === this._person) ? this._person : null;
		const all = people.length > 1 ? collect(snapshots, config) : [];
		const items = collect(snapshots, config, person);
		const open = (id: string) => all.filter((item) => item.open && item.owners.includes(id)).length;
		// A compact card keeps the add box folded behind a + button: a section cell has little height.
		const folded =
			!!config.quick_add && !config.kiosk && (config.density ?? DEFAULTS.density) === 'compact' && this._addTargets().length > 0;
		const height = config.height ? `max-height:${config.height}px` : '';
		return html`
			<ha-card>
				${config.title || offline
					? html`<header>
							<h2>${config.title ?? ''}</h2>
							${offline ? html`<span class="state">Server unreachable</span>` : nothing}
						</header>`
					: nothing}
				${(people.length > 1 && view !== 'board' && view !== 'tiles') || (folded && view !== 'tiles')
					? html`<div class="people" role="group" aria-label=${people.length > 1 ? 'People' : 'Actions'}>
							${people.length > 1
								? html`<button class="chip" aria-pressed=${person === null} @click=${() => (this._person = null)}>
										All <b>${all.filter((item) => item.open).length}</b>
									</button>`
								: nothing}
							${(people.length > 1 ? people : []).map(
								(who) =>
									html`<button
										class="chip"
										style="--who:${who.color}"
										aria-pressed=${person === who.entryId}
										@click=${() => (this._person = person === who.entryId ? null : who.entryId)}
									>
										<i class="dot"></i>${who.name} <b>${open(who.entryId)}</b>
									</button>`,
							)}
							${folded
								? html`<span class="grow"></span
										><button
											class="chip plus"
											aria-label="Add a task"
											title="Add a task"
											aria-expanded=${this._addOpen}
											@click=${this._toggleAdd}
										>
											${icon(icons.plus)}
										</button>`
								: nothing}
						</div>`
					: nothing}
				${view === 'tiles' ? nothing : this._renderAdd(folded && !this._addOpen)}
				<div class="body" style=${height}>
					${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
					${loading
						? html`<div class="empty">Loading…</div>`
						: this._renderView(view, items, snapshots, person)}
				</div>
				${this._draft ? this._renderDialog(this._draft) : nothing}
			</ha-card>
		`;
	}

	private async _toggleAdd(): Promise<void> {
		this._addOpen = !this._addOpen;
		this._addError = '';
		await this.updateComplete;
		if (this._addOpen) (this.renderRoot.querySelector('.add input') as HTMLInputElement | null)?.focus();
	}

	private _renderAdd(hidden = false): TemplateResult | typeof nothing {
		if (!this._config.quick_add) return nothing;
		const targets = this._addTargets();
		if (!targets.length) return nothing;
		if (this._config.kiosk) {
			return html`<button class="voice" @click=${this._assist}>${icon(icons.mic)} Add a task</button>`;
		}
		return html`
			<form class="add" ?hidden=${hidden} @submit=${this._add}>
				${icon(icons.plus)}
				<input
					type="text"
					maxlength="1000"
					enterkeyhint="done"
					aria-label="Add a task"
					placeholder="Add a task: tomorrow 9am #tag !high"
					?disabled=${this._adding}
				/>
				<select aria-label="List" ?hidden=${targets.length < 2}>
					${targets.map((t) => html`<option value=${t.value}>${t.label}</option>`)}
				</select>
			</form>
			${this._addError ? html`<div class="problem" role="alert">${this._addError}</div>` : nothing}
		`;
	}

	private _renderView(view: string, items: Item[], snapshots: Snapshot[], person: string | null): TemplateResult {
		const config = this._config;
		switch (view) {
			case 'list':
				return this._renderList(items, snapshots);
			case 'agenda':
				return this._renderGroups(agenda(items, this._today, config.days ?? DEFAULTS.days, this._language), true, false);
			case 'heatmap':
				return this._renderHeatmap(items);
			case 'week':
				return this._renderWeek(items);
			case 'next':
				return this._renderNext(items);
			case 'board':
				return this._renderBoard(snapshots);
			case 'shopping':
				return this._renderShopping(snapshots, person);
			case 'tiles':
				return this._renderTiles(snapshots);
			default:
				return this._renderGlance(items);
		}
	}

	/** Seven days in a row, a dot per open task in its person's color; a tap lists the day. */
	private _renderWeek(items: Item[]): TemplateResult {
		const language = this._language;
		const today = this._today;
		const days = week(items, today, 7);
		const selected = days.some((d) => d.day === this._selected) ? this._selected! : today;
		const people = this._person ? [] : this._people();
		const color = (item: Item) =>
			(people.length > 1 ? people.find((who) => item.owners.includes(who.entryId))?.color : undefined) ?? 'var(--pl-accent)';
		const late = selected === today ? overdue(items, today) : [];
		const shown = days.find((d) => d.day === selected)?.items ?? [];
		return html`
			<div class="week" role="group" aria-label="Days">
				${days.map((d) => {
					const open = d.items.filter((item) => item.open);
					return html`<button
						class="wday ${d.day === today ? 'today' : ''}"
						aria-pressed=${d.day === selected}
						aria-label=${`${formatDay(d.day, language, { weekday: 'long', month: 'long', day: 'numeric' })}: ${open.length} ${open.length === 1 ? 'task' : 'tasks'}`}
						@click=${() => (this._selected = d.day)}
					>
						<span class="wd">${formatDay(d.day, language, { weekday: 'short' })}</span>
						<b>${Number(d.day.slice(8))}</b>
						<span class="dots">
							${open.slice(0, 4).map((item) => html`<i style="background:${color(item)}"></i>`)}
							${open.length > 4 ? html`<em>+${open.length - 4}</em>` : nothing}
						</span>
					</button>`;
				})}
			</div>
			${late.length
				? html`<h3 class="late">Overdue</h3>
						<ul>
							${late.map((item) => this._renderRow({ item, subtasks: [] }, true))}
						</ul>`
				: nothing}
			<h3>${relativeDay(selected, today, language)} · ${formatDay(selected, language, { month: 'short', day: 'numeric' })}</h3>
			${shown.length
				? html`<ul>
						${shown.map((item) => this._renderRow({ item, subtasks: [] }, true, false))}
					</ul>`
				: html`<div class="none-today">Nothing planned.</div>`}
		`;
	}

	/** The one task to do next, large, with Done and Tomorrow. */
	private _renderNext(items: Item[]): TemplateResult {
		const today = this._today;
		const summary = glance(items, today, this._config.days ?? DEFAULTS.days, 1);
		const item = summary.next.find((each) => !this._pending.has(each.task.id)) ?? summary.next[0];
		if (!item) return html`<div class="hero"><div class="hero-title done">All clear. Nothing open.</div></div>`;
		const late = item.day !== null && item.day < today;
		const due = summary.overdue.length + summary.today.length - (item.day !== null && item.day <= today ? 1 : 0);
		const date = item.day
			? relativeDay(item.day, today, this._language) + (item.time ? `, ${formatTime(item.time, this._language)}` : '')
			: 'No date';
		const busy = this._pending.has(item.task.id);
		return html`
			<div class="hero">
				<div class="hero-when">
					<span class=${late ? 'late' : ''}>${date}</span>
					${item.list ? html`<span><i class="dot" style=${item.list.color ? `background:${item.list.color}` : ''}></i>${item.list.name}</span>` : nothing}
					${item.others.map((name) => html`<span>@${name}</span>`)}
				</div>
				<button class="hero-title" ?disabled=${!item.canWrite} @click=${() => this._edit(item)}>${item.task.title}</button>
				<div class="hero-actions">
					<button class="btn primary" ?disabled=${!item.canWrite || busy} @click=${() => this._toggle(item)}>${icon(icons.check)} Done</button>
					<button class="btn" ?disabled=${!item.canWrite || busy} @click=${() => this._postpone(item)}>Tomorrow</button>
				</div>
				${due > 0 ? html`<div class="hero-more">${due} more due</div>` : nothing}
			</div>
		`;
	}

	/** Put a task off to tomorrow, keeping its time of day. */
	private async _postpone(item: Item): Promise<void> {
		if (!item.canWrite || this._pending.has(item.task.id)) return;
		this._pending = new Set(this._pending).add(item.task.id);
		try {
			await this._send('update', item, { task_id: item.task.id, changes: dateChange(item.task, addDays(this._today, 1), item.time) });
		} catch (err) {
			this._pending = new Set([...this._pending].filter((id) => id !== item.task.id));
			this._problem = message(err);
			setTimeout(() => (this._problem = ''), 6000);
		}
	}

	/** A column per person: the tasks assigned to them, and the unassigned ones they can see. */
	private _renderBoard(snapshots: Snapshot[]): TemplateResult {
		const people = this._people();
		return html`<div class="board">
			${people.map((who) => {
				const mine = collect(snapshots, this._config, people.length > 1 ? who.entryId : null);
				return html`<section class="col" style="--who:${who.color}">
					<h3><i class="dot"></i>${who.name} <b>${mine.filter((item) => item.open).length}</b></h3>
					${mine.length
						? html`<ul>
								${mine.map((item) => this._renderRow({ item, subtasks: [] }, false, true, false))}
							</ul>`
						: html`<div class="none-today">Nothing open.</div>`}
				</section>`;
			})}
		</div>`;
	}

	/** A list to work through in a shop: what is left on top, what is in the cart below, and a way to clear it. */
	private _renderShopping(snapshots: Snapshot[], person: string | null): TemplateResult {
		const all = collect(snapshots, { ...this._config, show_completed: true, sort: this._config.sort ?? 'manual' }, person);
		const left = all.filter((item) => item.open);
		const got = all.filter((item) => !item.open);
		const clearable = got.filter((item) => item.canWrite);
		return html`
			${left.length ? this._renderList(left, snapshots) : html`<div class="empty">${got.length ? 'Everything is ticked off.' : 'Nothing on the list.'}</div>`}
			${got.length
				? html`<h3 class="got">
							Done
							<span class="grow"></span>
							${clearable.length ? html`<button class="clear" @click=${() => this._clear(clearable)}>Clear ${clearable.length}</button>` : nothing}
						</h3>
						<ul>
							${got.map((item) => this._renderRow({ item, subtasks: [] }, false))}
						</ul>`
				: nothing}
		`;
	}

	/** Take ticked-off tasks off the list. They go to PeckList's trash, where they can be restored. */
	private async _clear(items: Item[]): Promise<void> {
		this._pending = new Set([...this._pending, ...items.map((item) => item.task.id)]);
		try {
			for (const item of items) await this._send('delete', item, { task_id: item.task.id });
		} catch (err) {
			this._problem = message(err);
			setTimeout(() => (this._problem = ''), 6000);
		} finally {
			this._pending = new Set();
		}
	}

	/** One small tile per person: what is due today and what is late. Sized like a dashboard tile. */
	private _renderTiles(snapshots: Snapshot[]): TemplateResult {
		const people = this._people();
		const path = this._config.navigation_path;
		return html`<div class="tiles">
			${people.map((who) => {
				const counts = glance(collect(snapshots, this._config, people.length > 1 ? who.entryId : null), this._today, this._config.days ?? DEFAULTS.days, 0);
				const label = `${who.name}: ${counts.today.length} today, ${counts.overdue.length} overdue`;
				return html`<button class="tile" style="--who:${who.color}" aria-label=${label} ?disabled=${!path} @click=${this._navigate}>
					<i class="dot"></i>
					<span class="tile-name">${who.name}</span>
					<span class="tile-counts">
						<b>${counts.today.length}</b> today
						${counts.overdue.length ? html`<b class="late">${counts.overdue.length}</b> <span class="late">late</span>` : nothing}
					</span>
				</button>`;
			})}
		</div>`;
	}

	private _navigate(): void {
		const path = this._config.navigation_path;
		if (!path) return;
		history.pushState(null, '', path);
		window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true, detail: { replace: false } }));
	}

	private _renderGlance(items: Item[]): TemplateResult {
		const config = this._config;
		const summary = glance(items, this._today, config.days ?? DEFAULTS.days, config.max_items ?? DEFAULTS.max_items);
		const filter = this._filter;
		const shown = filter ? summary[filter] : summary.next;
		const count = (key: 'overdue' | 'today' | 'upcoming', label: string) => html`
			<button
				class="count ${key === 'overdue' ? 'late' : ''} ${summary[key].length ? '' : 'none'}"
				aria-pressed=${filter === key}
				@click=${() => (this._filter = filter === key ? null : key)}
			>
				<b>${summary[key].length}</b> <span>${label}</span>
			</button>
		`;
		return html`
			<div class="counts">${count('overdue', 'Overdue')} ${count('today', 'Today')} ${count('upcoming', 'Upcoming')}</div>
			${shown.length
				? html`<ul>
						${shown.map((item) => this._renderRow({ item, subtasks: [] }, true))}
					</ul>`
				: html`<div class="empty">${filter ? 'Nothing here.' : 'All clear. Nothing open.'}</div>`}
		`;
	}

	private _renderList(items: Item[], snapshots: Snapshot[]): TemplateResult {
		// Two people each have an Inbox: lists that share a name say whose they are.
		const names = this._people();
		const lists = snapshots.flatMap((s) => {
			const who = names.find((p) => p.entryId === s.account.entry_id)?.name ?? s.account.username;
			return s.lists.map((list) => ({ list, who }));
		});
		const named = lists.map(({ list, who }) =>
			lists.some((other) => other.list.id !== list.id && other.list.name === list.name) ? { ...list, name: `${list.name} (${who})` } : list,
		);
		const groups = byList(
			items,
			named,
			snapshots.flatMap((s) => s.sections),
		);
		if (groups.length === 1 && !groups[0]!.key.split('/')[1] && this._config.lists?.length === 1) {
			// One list, no sections: its name is the card's title to give, not a heading to repeat.
			return html`<ul>
				${groups[0]!.rows.map((row) => this._renderRow(row, false))}
			</ul>`;
		}
		// A card about one list need not repeat its name on every section.
		const one = this._config.lists?.length === 1;
		return this._renderGroups(one ? groups.map((g) => ({ ...g, label: g.label.split(' · ').pop() ?? g.label })) : groups, false);
	}

	private _renderGroups(groups: Group[], showList: boolean, showDay = true): TemplateResult {
		if (!groups.some((group) => group.rows.length)) return html`<div class="empty">Nothing to do here.</div>`;
		return html`<div class="groups">
			${groups.map(
				(group) => html`<section>
				<h3 class=${group.late ? 'late' : ''}>
					${group.color !== undefined ? html`<i class="dot" style=${group.color ? `background:${group.color}` : ''}></i>` : nothing}
					${group.label}
				</h3>
				${group.rows.length
					? html`<ul>
							${group.rows.map((row) => this._renderRow(row, showList, showDay))}
						</ul>`
					: html`<div class="none-today">Nothing planned.</div>`}
				</section>`,
			)}
		</div>`;
	}

	private _renderRow(row: Row, showList: boolean, showDay = true, stripe = true): TemplateResult {
		const { item } = row;
		const { task } = item;
		const pending = this._pending.has(task.id);
		const closed = item.open === pending; // a pending toggle shows where it is going
		const late = item.open && item.day !== null && item.day < this._today;
		// On a combined card a stripe says whose task it is; one person's view needs none.
		const everyone = this._person || !stripe ? [] : this._people();
		const whose = everyone.length > 1 ? everyone.filter((who) => item.owners.includes(who.entryId)) : [];
		// Under a day's heading the day is said already: only a time is news there.
		const date = [
			item.day && (showDay || late) ? relativeDay(item.day, this._today, this._language) : '',
			item.day && item.time ? formatTime(item.time, this._language) : '',
		]
			.filter(Boolean)
			.join(', ');
		return html`
			<li>
				<div class="row">
					${whose.length
						? html`<span class="who" role="img" aria-label=${whose.map((who) => who.name).join(', ')} title=${whose.map((who) => who.name).join(', ')}>
								${whose.map((who) => html`<i style="background:${who.color}"></i>`)}
							</span>`
						: nothing}
					<button
						class="check p${task.priority} ${closed ? 'closed' : ''}"
						role="checkbox"
						aria-checked=${closed}
						aria-label=${`${closed ? 'Reopen' : 'Complete'} ${task.title}`}
						?disabled=${!item.canWrite}
						@click=${() => this._toggle(item)}
					>
						${icon(icons.check)}
					</button>
					<button class="what" ?disabled=${!item.canWrite} @click=${() => this._edit(item)}>
						<span class="name">${task.title}</span>
						<span class="meta">
							${date ? html`<span class=${late ? 'late' : ''}>${date}</span>` : nothing}
							${task.recurrence ? html`<span title="Repeats">${icon(icons.repeat)}</span>` : nothing}
							${showList && item.list
								? html`<span class="in"><i class="dot" style=${item.list.color ? `background:${item.list.color}` : ''}></i>${item.list.name}</span>`
								: nothing}
							${item.others.map((name) => html`<span class="to">@${name}</span>`)}
							${task.tags.map((tag) => html`<span class="tag">#${tag}</span>`)}
						</span>
					</button>
				</div>
				${row.subtasks.length
					? html`<ul>
							${nest(row.subtasks).map((sub) => this._renderRow(sub, false))}
						</ul>`
					: nothing}
			</li>
		`;
	}

	private _renderHeatmap(items: Item[]): TemplateResult {
		const range = this._config.range ?? DEFAULTS.range;
		const anchor = this._anchor ?? this._today;
		const language = this._language;
		const start = firstWeekday(this._hass?.locale?.first_weekday, language);
		const weeks = heatmap(items, 'month', anchor, start);
		const selected = this._selected ?? this._today;
		const step = (direction: number) => {
			this._anchor = range === 'year' ? addMonths(anchor, 12 * direction) : addMonths(anchor, direction);
		};
		const label = range === 'year' ? anchor.slice(0, 4) : formatDay(anchor.slice(0, 7) + '-01', language, { month: 'long', year: 'numeric' });
		const weekdays = weeks[0]?.map((d) => formatDay(d.day, language, { weekday: 'narrow' })) ?? [];
		const cell = (d: HeatDay) => html`
				<button
					class="cell l${d.level} ${d.inRange ? '' : 'out'} ${d.day === this._today ? 'today' : ''}"
					style="--level:${d.level}"
					aria-pressed=${d.day === selected}
					aria-label=${`${formatDay(d.day, language, { weekday: 'long', month: 'long', day: 'numeric' })}: ${d.count} ${d.count === 1 ? 'task' : 'tasks'}`}
					title=${`${formatDay(d.day, language, { month: 'short', day: 'numeric' })}: ${d.count}`}
					tabindex=${d.inRange ? 0 : -1}
					@click=${() => (this._selected = d.day)}
				>
					${Number(d.day.slice(8))}
				</button>
			`;
		// A year is twelve small months, like the app's Year view.
		const months =
			range === 'year'
				? Array.from({ length: 12 }, (_, month) => `${anchor.slice(0, 4)}-${String(month + 1).padStart(2, '0')}-01`)
				: [];
		const dayItems = items.filter((item) => item.day === selected);
		return html`
			<div class="nav">
				<strong>${label}</strong>
				<button aria-label="Today" title="Today" @click=${() => ((this._anchor = null), (this._selected = null))}>${icon(icons.today)}</button>
				<button aria-label="Earlier" @click=${() => step(-1)}>${icon(icons.left)}</button>
				<button aria-label="Later" @click=${() => step(1)}>${icon(icons.right)}</button>
			</div>
			${range === 'year'
				? html`<div class="year">
						${months.map(
							(first) => html`
								<div>
									<div class="month-name">${formatDay(first, language, { month: 'short' })}</div>
									<div class="heat small">${heatmap(items, 'month', first, start).flat().map(cell)}</div>
								</div>
							`,
						)}
					</div>`
				: html`<div class="heat">${weekdays.map((name) => html`<span class="wd">${name}</span>`)} ${weeks.flat().map(cell)}</div>`}
			<div class="legend">
				Less ${[0, 1, 2, 3, 4].map((level) => html`<i style="--level:${level}"></i>`)} More
			</div>
			<h3>${relativeDay(selected, this._today, language)} · ${formatDay(selected, language, { month: 'short', day: 'numeric' })}</h3>
			${dayItems.length
				? html`<ul>
						${dayItems.map((item) => this._renderRow({ item, subtasks: [] }, true, false))}
					</ul>`
				: html`<div class="none-today">Nothing planned.</div>`}
		`;
	}

	private _renderDialog(draft: Draft): TemplateResult {
		const close = () => (this._draft = null);
		return html`
			<div
				class="scrim"
				@click=${(e: Event) => e.target === e.currentTarget && close()}
				@keydown=${(e: KeyboardEvent) => e.key === 'Escape' && close()}
			>
				<form role="dialog" aria-modal="true" aria-label="Edit task" @submit=${this._save}>
					<label>
						Title
						<input
							type="text"
							maxlength="2000"
							.value=${draft.title}
							@input=${(e: Event) => this._set({ title: (e.target as HTMLInputElement).value })}
						/>
					</label>
					<div class="two">
						<label>
							Date
							<input type="date" .value=${draft.day} @input=${(e: Event) => this._set({ day: (e.target as HTMLInputElement).value })} />
						</label>
						<label>
							Time
							<input
								type="time"
								.value=${draft.time}
								?disabled=${!draft.day}
								@input=${(e: Event) => this._set({ time: (e.target as HTMLInputElement).value })}
							/>
						</label>
					</div>
					<label id="prio">Priority</label>
					<div class="prio" role="group" aria-labelledby="prio">
						${PRIORITIES.map(
							(name, value) =>
								html`<button type="button" aria-pressed=${draft.priority === value} @click=${() => this._set({ priority: value })}>
									${name}
								</button>`,
						)}
					</div>
					${draft.assignees
						? html`<label id="assign">Assigned to</label>
								<div class="assign" role="group" aria-labelledby="assign">
									${this._assignable(draft.item).map(
										(who) =>
											html`<button
												type="button"
												class="chip"
												aria-pressed=${draft.assignees!.includes(who.id)}
												@click=${() =>
													this._set({
														assignees: draft.assignees!.includes(who.id)
															? draft.assignees!.filter((id) => id !== who.id)
															: [...draft.assignees!, who.id],
													})}
											>
												${who.me ? 'Me' : who.name}
											</button>`,
									)}
								</div>`
						: nothing}
					<label>
						Tags
						<input
							type="text"
							placeholder="home, yard/front"
							.value=${draft.tags}
							@input=${(e: Event) => this._set({ tags: (e.target as HTMLInputElement).value })}
						/>
					</label>
					<label>
						Notes
						<textarea .value=${draft.notes} @input=${(e: Event) => this._set({ notes: (e.target as HTMLTextAreaElement).value })}></textarea>
					</label>
					${draft.error ? html`<div class="error" role="alert">${draft.error}</div>` : nothing}
					<div class="actions">
						<button type="button" class="btn danger" ?disabled=${draft.saving} @click=${this._delete}>Delete</button>
						<span class="grow"></span>
						<button type="button" class="btn" @click=${close}>Cancel</button>
						<button type="submit" class="btn primary" ?disabled=${draft.saving}>Save</button>
					</div>
				</form>
			</div>
		`;
	}
}

if (!customElements.get('pecklist-card')) customElements.define('pecklist-card', PeckListCard);

const registry = window as unknown as { customCards?: Record<string, unknown>[] };
registry.customCards ??= [];
if (!registry.customCards.some((card) => card.type === 'pecklist-card')) {
	registry.customCards.push({
		type: 'pecklist-card',
		name: 'PeckList',
		description: 'Tasks from PeckList: at a glance, lists, an agenda or a busy-day heatmap.',
		preview: true,
		documentationURL: 'https://github.com/KillSwitchIO/pecklist-card',
	});
}
