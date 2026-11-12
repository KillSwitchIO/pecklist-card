// Turning snapshots into what each view shows. No DOM and no Home Assistant here, so it tests plainly.

import type { Account, CardConfig, Item, List, Section, Snapshot, Task, TaskDate } from './types';

export const DEFAULTS = {
	view: 'glance',
	scope: 'all',
	sort: 'date',
	density: 'comfortable',
	colors: 'theme',
	max_items: 5,
	days: 7,
	range: 'month',
} as const;

/** Colors for people, in the order their accounts were connected. Chosen to stay apart in light and dark. */
export const PERSON_COLORS = ['#4C8BF5', '#E0679A', '#E3A23B', '#3BA99C', '#9A6FE0', '#7BA23F', '#D9776B', '#5E6AD2'];

export interface PersonInfo {
	entryId: string;
	name: string;
	color: string;
}

/** Each account as a person: a display name and a color that stays the same on every card. */
export function people(accounts: Account[], shown: string[], overrides: Record<string, string> = {}): PersonInfo[] {
	return shown
		.map((id) => {
			const index = accounts.findIndex((account) => account.entry_id === id);
			const account = accounts[index];
			if (!account) return null;
			return {
				entryId: id,
				name: account.name || account.username || account.title,
				color: overrides[id] ?? PERSON_COLORS[index % PERSON_COLORS.length]!,
			};
		})
		.filter((person): person is PersonInfo => person !== null);
}

// Days, as YYYY-MM-DD strings. Kept as strings so no time zone can shift them.

export function todayIn(timeZone: string | undefined, now: Date = new Date()): string {
	try {
		return new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(now);
	} catch {
		return new Intl.DateTimeFormat('en-CA', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(now);
	}
}

function utc(day: string): Date {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
}

function fromUtc(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function addDays(day: string, count: number): string {
	const date = utc(day);
	date.setUTCDate(date.getUTCDate() + count);
	return fromUtc(date);
}

export function addMonths(day: string, count: number): string {
	const date = utc(day.slice(0, 7) + '-01');
	date.setUTCMonth(date.getUTCMonth() + count);
	return fromUtc(date);
}

/** 0 is Sunday. */
export function weekday(day: string): number {
	return utc(day).getUTCDay();
}

export function daysBetween(from: string, to: string): number {
	return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
}

export function formatDay(day: string, language: string, options: Intl.DateTimeFormatOptions): string {
	return new Intl.DateTimeFormat(language, { ...options, timeZone: 'UTC' }).format(utc(day));
}

/** "Today", "Tomorrow", "Yesterday", else a short date; the year only when it is not this one. */
export function relativeDay(day: string, today: string, language: string): string {
	const delta = daysBetween(today, day);
	if (delta >= -1 && delta <= 1) {
		const text = new Intl.RelativeTimeFormat(language, { numeric: 'auto' }).format(delta, 'day');
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
	if (delta > 1 && delta < 7) return formatDay(day, language, { weekday: 'long' });
	return formatDay(day, language, {
		month: 'short',
		day: 'numeric',
		...(day.slice(0, 4) === today.slice(0, 4) ? {} : { year: 'numeric' }),
	});
}

export function formatTime(time: string, language: string): string {
	const [h, m] = time.split(':').map(Number);
	return new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(
		new Date(Date.UTC(2000, 0, 1, h ?? 0, m ?? 0)),
	);
}

// Tasks

/** The one date a task shows: its due date, else its scheduled start. As written, in the task's own zone. */
export function when(task: Task): { day: string | null; time: string | null; field: 'due' | 'schedule' | null } {
	const value = task.due?.at ?? null;
	const field = value ? 'due' : task.schedule?.start ? 'schedule' : null;
	const text = value ?? task.schedule?.start ?? null;
	if (!text || !/^\d{4}-\d{2}-\d{2}/u.test(text)) return { day: null, time: null, field: null };
	return { day: text.slice(0, 10), time: text.length >= 16 ? text.slice(11, 16) : null, field };
}

/** The change that sets a task's date, on the field its date came from (a new date goes on the schedule). */
export function dateChange(task: Task, day: string | null, time: string | null): Partial<Record<'due' | 'schedule', TaskDate | null>> {
	const { field } = when(task);
	if (!day) return field ? { [field]: null } : {};
	const text = time ? `${day}T${time}` : day;
	if (field === 'due') return { due: { at: text, allDay: !time } };
	return { schedule: { start: text, end: null, allDay: !time } };
}

function compare(sort: string): (a: Item, b: Item) => number {
	const text = (a: Item, b: Item) => a.task.title.localeCompare(b.task.title, undefined, { sensitivity: 'base' });
	const date = (a: Item, b: Item) =>
		(a.day ?? '9999').localeCompare(b.day ?? '9999') || (a.time ?? '').localeCompare(b.time ?? '');
	const priority = (a: Item, b: Item) => b.task.priority - a.task.priority;
	const created = (a: Item, b: Item) => (b.task.createdAt ?? '').localeCompare(a.task.createdAt ?? '');
	// The apps' order keys compare byte by byte; a task without one (an older server) goes last.
	const manual = (a: Item, b: Item) => {
		const x = a.task.order ?? '\uffff';
		const y = b.task.order ?? '\uffff';
		return x < y ? -1 : x > y ? 1 : 0;
	};
	const order =
		sort === 'priority'
			? [priority, date, text]
			: sort === 'title'
				? [text, date]
				: sort === 'created'
					? [created, text]
					: sort === 'manual'
						? [manual, date, text]
						: [date, priority, text];
	return (a, b) => {
		if (a.open !== b.open) return a.open ? -1 : 1;
		for (const by of order) {
			const result = by(a, b);
			if (result) return result;
		}
		return a.task.id.localeCompare(b.task.id);
	};
}

/**
 * Every task the card shows, from the chosen people's snapshots. A task several people can see (a
 * shared list) comes once, written through the first account that may change it.
 *
 * `person` narrows it to one person's tasks: those assigned to them, and unassigned ones they can see.
 */
export function collect(snapshots: Snapshot[], config: CardConfig, person: string | null = null): Item[] {
	const byId = new Map<string, Item>();
	const wantLists = new Set(config.lists ?? []);
	const wantTags = (config.tags ?? []).map((t) => t.toLowerCase());
	const scope = config.scope ?? DEFAULTS.scope;
	for (const snapshot of snapshots) {
		const lists = new Map(snapshot.lists.map((list) => [list.id, list]));
		const me = `user:${snapshot.account.user_id}`;
		for (const task of snapshot.tasks) {
			const list = lists.get(task.listId ?? '') ?? null;
			if (!list) continue;
			if (wantLists.size && !wantLists.has(list.id)) continue;
			if (scope === 'own' && list.role !== 'owner') continue;
			if (scope === 'assigned' && !task.assignees.includes(me)) continue;
			if (
				wantTags.length &&
				!task.tags.some((tag) => wantTags.some((want) => tag.toLowerCase() === want || tag.toLowerCase().startsWith(want + '/')))
			)
				continue;
			const open = task.status === 'open';
			if (!open && !config.show_completed) continue;
			const canWrite = snapshot.account.can_write && (list.role === 'owner' || list.role === 'editor');
			const seen = byId.get(task.id);
			if (seen) {
				seen.seenBy.push(snapshot.account.entry_id);
				if (!seen.canWrite && canWrite) {
					seen.entryId = snapshot.account.entry_id;
					seen.canWrite = true;
				}
				continue;
			}
			const { day, time } = when(task);
			byId.set(task.id, {
				task,
				entryId: snapshot.account.entry_id,
				seenBy: [snapshot.account.entry_id],
				owners: [],
				others: [],
				list,
				day,
				time,
				open,
				canWrite,
			});
		}
	}
	// Whose task it is: the shown people it is assigned to; unassigned, everyone who can see it.
	const byUser = new Map(snapshots.map((s) => [`user:${s.account.user_id}`, s.account.entry_id]));
	const names = new Map(snapshots.flatMap((s) => (s.people ?? []).map((p) => [p.id, p.name] as const)));
	for (const item of byId.values()) {
		const assigned = item.task.assignees.map((a) => byUser.get(a)).filter((id): id is string => !!id);
		item.owners = assigned.length ? assigned : item.seenBy;
		item.others = item.task.assignees.filter((a) => !byUser.has(a)).map((a) => names.get(a)).filter((n): n is string => !!n);
	}
	const items = person ? [...byId.values()].filter((item) => item.owners.includes(person)) : [...byId.values()];
	return items.sort(compare(config.sort ?? DEFAULTS.sort));
}

export interface Glance {
	overdue: Item[];
	today: Item[];
	upcoming: Item[];
	next: Item[];
}

/** Counts for the top of the card, and the next few open tasks: late ones first, then by date. */
export function glance(items: Item[], today: string, days: number, max: number): Glance {
	const open = items.filter((item) => item.open);
	const horizon = addDays(today, days);
	const overdue = open.filter((item) => item.day !== null && item.day < today);
	const now = open.filter((item) => item.day === today);
	const upcoming = open.filter((item) => item.day !== null && item.day > today && item.day <= horizon);
	const dated = [...overdue, ...now, ...upcoming];
	const undated = open.filter((item) => item.day === null);
	return { overdue, today: now, upcoming, next: [...dated, ...undated].slice(0, Math.max(0, max)) };
}

export interface Row {
	item: Item;
	subtasks: Item[];
}

export interface Group {
	key: string;
	label: string;
	color?: string | null;
	late?: boolean;
	rows: Row[];
}

/** Subtasks under their parent when the parent is shown too; otherwise on their own. */
export function nest(items: Item[]): Row[] {
	const shown = new Set(items.map((item) => item.task.id));
	const children = new Map<string, Item[]>();
	for (const item of items) {
		const parent = item.task.parentId;
		if (parent && shown.has(parent)) children.set(parent, [...(children.get(parent) ?? []), item]);
	}
	return items
		.filter((item) => !(item.task.parentId && shown.has(item.task.parentId)))
		.map((item) => ({ item, subtasks: children.get(item.task.id) ?? [] }));
}

/** The list view: a group per list and section, in the lists' order, sections after the unsectioned tasks. */
export function byList(items: Item[], lists: List[], sections: Section[]): Group[] {
	const sectionNames = new Map(sections.map((section) => [section.id, section.name]));
	const groups: Group[] = [];
	const seenLists = new Set<string>();
	for (const list of lists) {
		if (seenLists.has(list.id)) continue;
		seenLists.add(list.id);
		const mine = items.filter((item) => item.list?.id === list.id);
		if (!mine.length) continue;
		const buckets = new Map<string, Item[]>();
		for (const item of mine) {
			// A subtask sits with its parent, whatever section it names itself.
			const key = item.task.sectionId && sectionNames.has(item.task.sectionId) ? item.task.sectionId : '';
			buckets.set(key, [...(buckets.get(key) ?? []), item]);
		}
		const keys = [...buckets.keys()].sort((a, b) =>
			a === '' ? -1 : b === '' ? 1 : (sectionNames.get(a) ?? '').localeCompare(sectionNames.get(b) ?? ''),
		);
		for (const key of keys) {
			groups.push({
				key: `${list.id}/${key}`,
				label: key ? `${list.name} · ${sectionNames.get(key)}` : list.name,
				color: list.color,
				rows: nest(buckets.get(key) ?? []),
			});
		}
	}
	return groups;
}

/** The agenda: what is late, then today and each of the next days that has something. */
export function agenda(items: Item[], today: string, days: number, language: string): Group[] {
	const groups: Group[] = [];
	const late = items.filter((item) => item.open && item.day !== null && item.day < today);
	if (late.length) groups.push({ key: 'late', label: 'Overdue', late: true, rows: late.map((item) => ({ item, subtasks: [] })) });
	for (let offset = 0; offset <= days; offset++) {
		const day = addDays(today, offset);
		const rows = items.filter((item) => item.day === day).map((item) => ({ item, subtasks: [] }));
		if (!rows.length && offset > 0) continue;
		const name = relativeDay(day, today, language);
		const date = formatDay(day, language, { month: 'short', day: 'numeric' });
		groups.push({ key: day, label: offset < 2 ? `${name} · ${date}` : `${formatDay(day, language, { weekday: 'long' })} · ${date}`, rows });
	}
	return groups;
}

export interface HeatDay {
	day: string;
	count: number;
	/** 0 (nothing) to 4 (busiest). */
	level: number;
	inRange: boolean;
}

export function heatLevel(count: number): number {
	return count <= 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
}

/**
 * Whole weeks covering a month or a year, each day with how many tasks fall on it. Days outside the
 * month or year pad the first and last week.
 */
export function heatmap(items: Item[], range: 'month' | 'year', anchor: string, weekStart: number): HeatDay[][] {
	const counts = new Map<string, number>();
	for (const item of items) if (item.day) counts.set(item.day, (counts.get(item.day) ?? 0) + 1);
	const first = range === 'year' ? `${anchor.slice(0, 4)}-01-01` : `${anchor.slice(0, 7)}-01`;
	const last = range === 'year' ? `${anchor.slice(0, 4)}-12-31` : addDays(addMonths(first, 1), -1);
	let day = addDays(first, -((weekday(first) - weekStart + 7) % 7));
	const weeks: HeatDay[][] = [];
	while (day <= last) {
		const week: HeatDay[] = [];
		for (let i = 0; i < 7; i++) {
			const count = counts.get(day) ?? 0;
			week.push({ day, count, level: heatLevel(count), inRange: day >= first && day <= last });
			day = addDays(day, 1);
		}
		weeks.push(week);
	}
	return weeks;
}

/** 0 for Sunday, 1 for Monday...: Home Assistant's setting, else the language's custom. */
export function firstWeekday(setting: string | undefined, language: string): number {
	const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	const fixed = names.indexOf(setting ?? '');
	if (fixed >= 0) return fixed;
	try {
		const locale = new Intl.Locale(language) as Intl.Locale & {
			weekInfo?: { firstDay: number };
			getWeekInfo?: () => { firstDay: number };
		};
		const info = locale.getWeekInfo?.() ?? locale.weekInfo;
		if (info) return info.firstDay % 7;
	} catch {
		// An unknown language tag: fall through.
	}
	return 0;
}

/** Tags typed as "home, yard/front #garden": names without the #, no empties, no repeats. */
export function parseTags(text: string): string[] {
	const seen = new Set<string>();
	for (const part of text.split(/[,\s]+/u)) {
		const tag = part.replace(/^#/u, '').trim();
		if (tag) seen.add(tag);
	}
	return [...seen];
}
