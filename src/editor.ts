// The visual editor: Home Assistant's own form element, fed a schema built from the connected accounts.

import { LitElement, type TemplateResult, html, nothing } from 'lit';
import { DEFAULTS } from './data';
import type { Accounts, CardConfig, HomeAssistant, Snapshot } from './types';

interface Option {
	value: string;
	label: string;
}

const LABELS: Record<string, string> = {
	view: 'View',
	title: 'Title',
	entries: 'People',
	scope: 'Which tasks',
	lists: 'Lists',
	tags: 'Tags',
	sort: 'Sort by',
	density: 'Spacing',
	colors: 'Colors',
	show_completed: 'Show completed tasks',
	quick_add: 'Show the add box',
	kiosk: 'Wall tablet layout',
	max_items: 'Tasks to list',
	days: 'Days ahead',
	range: 'Range',
	height: 'Height in pixels (0 grows to fit)',
};

const HELP: Record<string, string> = {
	entries: 'Leave empty to show the signed-in person their own tasks, or everyone when accounts are not matched to people.',
	scope: '"Their own lists" leaves out lists shared with them. "Assigned to them" shows only tasks they are assigned.',
	lists: 'Leave empty for every list.',
	tags: 'Leave empty for every tag. A tag also matches the tags under it.',
	kiosk: 'Large touch targets, and adding goes through Assist voice instead of a keyboard.',
};

function select(name: string, options: Option[], multiple = false, custom = false): Record<string, unknown> {
	return { name, selector: { select: { options, multiple, custom_value: custom, mode: multiple ? 'list' : 'dropdown' } } };
}

export function schema(config: CardConfig, people: Option[], lists: Option[], tags: Option[]): Record<string, unknown>[] {
	const view = config.view ?? DEFAULTS.view;
	const number = (name: string, min: number, max: number) => ({ name, selector: { number: { min, max, step: 1, mode: 'box' } } });
	return [
		select('view', [
			{ value: 'glance', label: 'At a glance' },
			{ value: 'list', label: 'List' },
			{ value: 'agenda', label: 'Agenda' },
			{ value: 'heatmap', label: 'Busy-day heatmap' },
		]),
		{ name: 'title', selector: { text: {} } },
		...(view === 'glance' ? [number('max_items', 0, 50), number('days', 1, 60)] : []),
		...(view === 'agenda' ? [number('days', 1, 60)] : []),
		...(view === 'heatmap'
			? [
					select('range', [
						{ value: 'month', label: 'Month' },
						{ value: 'year', label: 'Year' },
					]),
				]
			: []),
		...(people.length > 1 ? [select('entries', people, true)] : []),
		select('scope', [
			{ value: 'all', label: 'Everything they can see' },
			{ value: 'own', label: 'Their own lists' },
			{ value: 'assigned', label: 'Assigned to them' },
		]),
		...(lists.length ? [select('lists', lists, true)] : []),
		...(tags.length ? [select('tags', tags, true, true)] : []),
		select('sort', [
			{ value: 'date', label: 'Date' },
			{ value: 'priority', label: 'Priority' },
			{ value: 'title', label: 'Title' },
			{ value: 'created', label: 'Newest first' },
			{ value: 'manual', label: 'As in PeckList' },
		]),
		select('density', [
			{ value: 'comfortable', label: 'Comfortable' },
			{ value: 'compact', label: 'Compact' },
		]),
		select('colors', [
			{ value: 'theme', label: 'Follow the Home Assistant theme' },
			{ value: 'pecklist', label: 'PeckList colors (Forest)' },
		]),
		{ name: 'show_completed', selector: { boolean: {} } },
		{ name: 'quick_add', selector: { boolean: {} } },
		{ name: 'kiosk', selector: { boolean: {} } },
		number('height', 0, 2000),
	];
}

/** The configuration to save: defaults and empty choices left out, so the YAML stays short. */
export function tidy(config: CardConfig): CardConfig {
	const out: Record<string, unknown> = { type: config.type };
	for (const [key, value] of Object.entries(config)) {
		if (key === 'type' || value === undefined || value === null || value === '' || value === false) continue;
		if (Array.isArray(value) && !value.length) continue;
		if (key in DEFAULTS && (DEFAULTS as Record<string, unknown>)[key] === value) continue;
		if (key === 'height' && !value) continue;
		out[key] = value;
	}
	return out as unknown as CardConfig;
}

export class PeckListCardEditor extends LitElement {
	static properties = {
		hass: { attribute: false },
		_config: { state: true },
		_accounts: { state: true },
		_snapshots: { state: true },
	};

	declare hass?: HomeAssistant;
	declare _config?: CardConfig;
	declare _accounts: Accounts | null;
	declare _snapshots: Snapshot[];
	private _loading = false;

	constructor() {
		super();
		this._accounts = null;
		this._snapshots = [];
	}

	setConfig(config: CardConfig): void {
		this._config = config;
	}

	protected updated(): void {
		if (this.hass && !this._accounts && !this._loading) void this._load(this.hass);
	}

	/** One look at each account, for the people, lists and tags there are to choose from. */
	private async _load(hass: HomeAssistant): Promise<void> {
		this._loading = true;
		try {
			const accounts = await hass.callWS<Accounts>({ type: 'pecklist/accounts' });
			const snapshots: Snapshot[] = [];
			for (const account of accounts.accounts) {
				await new Promise<void>((resolve) => {
					let stop: (() => void) | undefined;
					let done = false;
					const finish = () => {
						done = true;
						stop?.();
						resolve();
					};
					hass.connection
						.subscribeMessage<Snapshot>(
							(snapshot) => {
								if (!done) snapshots.push(snapshot);
								finish();
							},
							{ type: 'pecklist/subscribe', entry_id: account.entry_id },
						)
						.then((unsubscribe) => {
							stop = unsubscribe;
							if (done) unsubscribe();
						}, finish);
				});
			}
			this._snapshots = snapshots;
			this._accounts = accounts;
		} catch {
			this._accounts = { version: 0, accounts: [], mine: null };
		}
	}

	protected render(): TemplateResult | typeof nothing {
		if (!this.hass || !this._config) return nothing;
		const chosen = new Set(this._config.entries ?? []);
		const from = this._snapshots.filter((s) => !chosen.size || chosen.has(s.account.entry_id));
		const several = from.length > 1;
		const lists = new Map<string, string>();
		const tags = new Set<string>();
		for (const snapshot of from) {
			for (const list of snapshot.lists) {
				if (!lists.has(list.id)) lists.set(list.id, several && !list.shared ? `${list.name} (${snapshot.account.username})` : list.name);
			}
			for (const tag of snapshot.tags) tags.add(tag.name);
		}
		// Choices already saved stay choosable even when their list or tag is gone.
		for (const id of this._config.lists ?? []) if (!lists.has(id)) lists.set(id, id);
		for (const tag of this._config.tags ?? []) tags.add(tag);
		const people = (this._accounts?.accounts ?? []).map((a) => ({ value: a.entry_id, label: a.username || a.title }));
		return html`
			<ha-form
				.hass=${this.hass}
				.data=${{ ...DEFAULTS, ...this._config }}
				.schema=${schema(
					this._config,
					people,
					[...lists].map(([value, label]) => ({ value, label })),
					[...tags].sort().map((tag) => ({ value: tag, label: tag })),
				)}
				.computeLabel=${(field: { name: string }) => LABELS[field.name] ?? field.name}
				.computeHelper=${(field: { name: string }) => HELP[field.name] ?? ''}
				@value-changed=${this._changed}
			></ha-form>
		`;
	}

	private _changed(event: CustomEvent<{ value: CardConfig }>): void {
		event.stopPropagation();
		const config = tidy({ ...event.detail.value, type: this._config?.type ?? 'custom:pecklist-card' });
		this._config = config;
		this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
	}
}

if (!customElements.get('pecklist-card-editor')) customElements.define('pecklist-card-editor', PeckListCardEditor);
