import { LitElement, type TemplateResult, html, nothing, svg } from 'lit';
import {
	DEFAULTS,
	type Group,
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
	parseTags,
	relativeDay,
	todayIn,
} from './data';
import './editor';
import { icons, styles } from './styles';
import type { Account, Accounts, CardConfig, HomeAssistant, Item, Snapshot } from './types';

const PRIORITIES = ['None', 'Low', 'Medium', 'High'];

interface Draft {
	item: Item;
	title: string;
	day: string;
	time: string;
	priority: number;
	tags: string;
	notes: string;
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
		_hidden: { state: true },
		_pending: { state: true },
		_draft: { state: true },
		_anchor: { state: true },
		_selected: { state: true },
		_filter: { state: true },
		_adding: { state: true },
		_addError: { state: true },
		_today: { state: true },
	};

	declare _config: CardConfig;
	declare _accounts: Accounts | null;
	declare _snapshots: Map<string, Snapshot>;
	declare _problem: string;
	declare _hidden: Set<string>;
	declare _pending: Set<string>;
	declare _draft: Draft | null;
	declare _anchor: string | null;
	declare _selected: string | null;
	declare _filter: 'overdue' | 'today' | 'upcoming' | null;
	declare _adding: boolean;
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
		this._hidden = new Set();
		this._pending = new Set();
		this._draft = null;
		this._anchor = null;
		this._selected = null;
		this._filter = null;
		this._adding = false;
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
		if (config.view && !['glance', 'list', 'agenda', 'heatmap'].includes(config.view)) {
			throw new Error(`Unknown view "${config.view}": use glance, list, agenda or heatmap`);
		}
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
		return this._config.view === 'heatmap' ? 7 : 5;
	}

	getGridOptions(): Record<string, number> {
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
			.filter((s): s is Snapshot => !!s && !this._hidden.has(s.account.entry_id));
	}

	private _people(): Account[] {
		return this._wanted
			.split(',')
			.map((id) => this._snapshots.get(id)?.account)
			.filter((a): a is Account => !!a);
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
		const snapshots = this._shown().filter((s) => s.account.can_write);
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
			saving: false,
			error: '',
		};
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
		const items = collect(snapshots, config);
		const height = config.height ? `max-height:${config.height}px` : '';
		return html`
			<ha-card>
				${config.title || offline
					? html`<header>
							<h2>${config.title ?? ''}</h2>
							${offline ? html`<span class="state">Server unreachable</span>` : nothing}
						</header>`
					: nothing}
				${people.length > 1
					? html`<div class="people" role="group" aria-label="People">
							${people.map(
								(person) =>
									html`<button
										class="chip"
										aria-pressed=${!this._hidden.has(person.entry_id)}
										@click=${() => this._togglePerson(person.entry_id)}
									>
										${person.username}
									</button>`,
							)}
						</div>`
					: nothing}
				${this._renderAdd()}
				<div class="body" style=${height}>
					${this._problem ? html`<div class="problem" role="alert">${this._problem}</div>` : nothing}
					${loading
						? html`<div class="empty">Loading…</div>`
						: view === 'list'
							? this._renderList(items, snapshots)
							: view === 'agenda'
								? this._renderGroups(agenda(items, this._today, config.days ?? DEFAULTS.days, this._language), true, false)
								: view === 'heatmap'
									? this._renderHeatmap(items)
									: this._renderGlance(items)}
				</div>
				${this._draft ? this._renderDialog(this._draft) : nothing}
			</ha-card>
		`;
	}

	private _togglePerson(id: string): void {
		const hidden = new Set(this._hidden);
		if (hidden.has(id)) hidden.delete(id);
		else hidden.add(id);
		this._hidden = hidden;
	}

	private _renderAdd(): TemplateResult | typeof nothing {
		if (!this._config.quick_add) return nothing;
		const targets = this._addTargets();
		if (!targets.length) return nothing;
		if (this._config.kiosk) {
			return html`<button class="voice" @click=${this._assist}>${icon(icons.mic)} Add a task</button>`;
		}
		return html`
			<form class="add" @submit=${this._add}>
				${icon(icons.plus)}
				<input
					type="text"
					maxlength="1000"
					enterkeyhint="done"
					aria-label="Add a task"
					placeholder="Add a task: tomorrow 9am #tag !high"
					?disabled=${this._adding}
				/>
				${targets.length > 1
					? html`<select aria-label="List">
							${targets.map((t) => html`<option value=${t.value}>${t.label}</option>`)}
						</select>`
					: nothing}
			</form>
			${this._addError ? html`<div class="problem" role="alert">${this._addError}</div>` : nothing}
		`;
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
		const groups = byList(
			items,
			snapshots.flatMap((s) => s.lists),
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
		return html`${groups.map(
			(group) => html`
				<h3 class=${group.late ? 'late' : ''}>
					${group.color !== undefined ? html`<i class="dot" style=${group.color ? `background:${group.color}` : ''}></i>` : nothing}
					${group.label}
				</h3>
				${group.rows.length
					? html`<ul>
							${group.rows.map((row) => this._renderRow(row, showList, showDay))}
						</ul>`
					: html`<div class="none-today">Nothing planned.</div>`}
			`,
		)}`;
	}

	private _renderRow(row: Row, showList: boolean, showDay = true): TemplateResult {
		const { item } = row;
		const { task } = item;
		const pending = this._pending.has(task.id);
		const closed = item.open === pending; // a pending toggle shows where it is going
		const late = item.open && item.day !== null && item.day < this._today;
		const several = this._people().length > 1;
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
								? html`<span><i class="dot" style=${item.list.color ? `background:${item.list.color}` : ''}></i>${item.list.name}</span>`
								: nothing}
							${task.tags.map((tag) => html`<span>#${tag}</span>`)}
							${several ? html`<span>${item.people.join(', ')}</span>` : nothing}
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
