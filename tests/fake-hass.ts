// A stand-in for Home Assistant with the PeckList integration: answers the card's websocket
// commands from memory. The tests and the demo page (demo/) both use it.

import { addDays, dateChange } from '../src/data';
import type { Account, HomeAssistant, List, Section, Snapshot, Task } from '../src/types';

export function task(id: string, title: string, listId: string, extra: Partial<Task> = {}): Task {
	return {
		id,
		title,
		notes: '',
		listId,
		sectionId: null,
		parentId: null,
		status: 'open',
		completedAt: null,
		priority: 0,
		schedule: null,
		due: null,
		tags: [],
		assignees: [],
		recurrence: null,
		createdAt: '2026-11-01T00:00:00.000Z',
		...extra,
	};
}

export function list(id: string, name: string, extra: Partial<List> = {}): List {
	return { id, name, color: null, isInbox: false, shared: false, role: 'owner', ...extra };
}

export interface Person {
	account: Account;
	lists: List[];
	sections: Section[];
	tasks: Task[];
}

export function person(entryId: string, username: string, extra: Partial<Account> = {}): Person {
	return {
		account: {
			entry_id: entryId,
			title: username,
			username,
			name: username.charAt(0).toUpperCase() + username.slice(1),
			user_id: `u-${username}`,
			can_write: true,
			ha_user: null,
			...extra,
		},
		lists: [],
		sections: [],
		tasks: [],
	};
}

export class FakeHass implements HomeAssistant {
	config = { time_zone: 'America/Chicago' };
	locale = { language: 'en', first_weekday: 'sunday' };
	user = { id: 'ha-ben', name: 'Ben' };
	calls: Record<string, unknown>[] = [];
	fail = '';
	private listeners = new Map<string, Set<(snapshot: Snapshot) => void>>();
	private revision = 0;

	constructor(
		public people: Person[],
		public mine: string | null = null,
	) {}

	snapshot(who: Person): Snapshot {
		return {
			revision: ++this.revision,
			account: who.account,
			connected: true,
			live: true,
			completed_days: 7,
			time_zone: this.config.time_zone,
			lists: who.lists,
			sections: who.sections,
			tags: [...new Set(who.tasks.flatMap((t) => t.tags))].sort().map((name) => ({ id: name, name, color: null })),
			people: this.people.map((p) => ({
				id: `user:${p.account.user_id}`,
				kind: 'user' as const,
				name: p.account.name ?? p.account.username,
				handle: p.account.username,
				me: p === who,
				assignable: true,
			})),
			tasks: who.tasks.map((t) => ({ ...t })),
		};
	}

	/** Tell every subscriber, as the integration does after any change. */
	push(): void {
		for (const who of this.people) {
			for (const listener of this.listeners.get(who.account.entry_id) ?? []) listener(this.snapshot(who));
		}
	}

	private find(entryId: string): Person {
		const who = this.people.find((p) => p.account.entry_id === entryId);
		if (!who) throw { code: 'not_found', message: 'No such PeckList account' };
		return who;
	}

	/** A change to a task reaches everyone who can see it (a shared list). */
	private change(taskId: string, apply: (t: Task) => void): Task {
		let found: Task | undefined;
		for (const who of this.people) {
			for (const t of who.tasks) {
				if (t.id === taskId) {
					apply(t);
					found = t;
				}
			}
		}
		if (!found) throw { code: 'pecklist_error', message: `No such task: ${taskId}` };
		return found;
	}

	async callWS<T>(message: Record<string, unknown>): Promise<T> {
		this.calls.push(message);
		const type = String(message.type);
		if (type === 'pecklist/accounts') {
			return { version: 1, accounts: this.people.map((p) => p.account), mine: this.mine } as T;
		}
		if (this.fail) throw { code: 'pecklist_error', message: this.fail };
		const who = this.find(String(message.entry_id));
		let answer: unknown = null;
		if (type === 'pecklist/task/complete') {
			answer = { completed: this.change(String(message.task_id), (t) => ((t.status = 'done'), (t.completedAt = new Date().toISOString()))), next: null };
		} else if (type === 'pecklist/task/reopen') {
			answer = this.change(String(message.task_id), (t) => ((t.status = 'open'), (t.completedAt = null)));
		} else if (type === 'pecklist/task/update') {
			answer = this.change(String(message.task_id), (t) => Object.assign(t, message.changes));
		} else if (type === 'pecklist/task/delete') {
			for (const p of this.people) p.tasks = p.tasks.filter((t) => t.id !== message.task_id);
		} else if (type === 'pecklist/task/quick_add') {
			// A rough stand-in for the server's quick add: #tags, !priority, "today" and "tomorrow".
			const words = String(message.text).split(/\s+/u);
			const today = new Intl.DateTimeFormat('en-CA', { timeZone: this.config.time_zone }).format(new Date());
			const day = words.includes('tomorrow') ? addDays(today, 1) : words.includes('today') ? today : null;
			const made = task(`new-${who.tasks.length}-${this.revision}`, words.filter((w) => !/^[#!^]|^(today|tomorrow)$/u.test(w)).join(' '), String(message.list_id ?? who.lists[0]?.id), {
				tags: words.filter((w) => w.startsWith('#')).map((w) => w.slice(1)),
				priority: words.includes('!high') ? 3 : words.includes('!med') ? 2 : words.includes('!low') ? 1 : 0,
				createdAt: new Date().toISOString(),
			});
			Object.assign(made, dateChange(made, day, null));
			who.tasks.push(made);
			answer = { task: made, tokens: [] };
		} else {
			throw { code: 'unknown_command', message: `Unknown command ${type}` };
		}
		queueMicrotask(() => this.push());
		return answer as T;
	}

	connection = {
		subscribeMessage: async <T>(callback: (message: T) => void, message: Record<string, unknown>): Promise<() => void> => {
			this.calls.push(message);
			const who = this.find(String(message.entry_id));
			const id = who.account.entry_id;
			const listener = callback as unknown as (snapshot: Snapshot) => void;
			if (!this.listeners.has(id)) this.listeners.set(id, new Set());
			this.listeners.get(id)!.add(listener);
			queueMicrotask(() => listener(this.snapshot(who)));
			return () => this.listeners.get(id)?.delete(listener);
		},
	};

	subscribers(): number {
		return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
	}
}

/** A household: Ben and Sam, their own lists, and a shared Household list. */
export function household(today: string): FakeHass {
	const day = (offset: number) => addDays(today, offset);
	const on = (offset: number, time?: string) => ({ start: time ? `${day(offset)}T${time}` : day(offset), end: null, allDay: !time });
	const shared = list('household', 'Household', { color: '#E3B068', shared: true });
	const householdTasks = [
		task('h1', 'Take out the bins', 'household', { schedule: on(0), recurrence: 'FREQ=WEEKLY', assignees: ['user:u-sam'], tags: ['home'] }),
		task('h2', 'Book the plumber', 'household', { due: { at: day(-2) }, priority: 3, assignees: ['user:u-ben'] }),
		task('h3', 'Groceries', 'household', { schedule: on(1), tags: ['errands'] }),
		task('h3a', 'Milk', 'household', { parentId: 'h3' }),
		task('h3b', 'Coffee beans', 'household', { parentId: 'h3' }),
	];
	const ben = person('ben', 'ben', { ha_user: 'ha-ben' });
	ben.lists = [list('inbox-ben', 'Inbox', { isInbox: true }), list('chores', 'Chores', { color: '#5A8A4E' }), list('flying', 'Flying', { color: '#3A7CA5' }), shared];
	ben.sections = [
		{ id: 's-out', listId: 'chores', name: 'Outside' },
		{ id: 's-in', listId: 'chores', name: 'Inside' },
	];
	ben.tasks = [
		task('b1', 'Empty the dishwasher', 'chores', { schedule: on(0, '18:00'), sectionId: 's-in', priority: 2, tags: ['home'] }),
		task('b2', 'Mow the lawn', 'chores', { schedule: on(2), sectionId: 's-out', tags: ['home/yard'], recurrence: 'FREQ=WEEKLY;BYDAY=SA' }),
		task('b3', 'Clean the gutters', 'chores', { schedule: on(9), sectionId: 's-out', priority: 1, tags: ['home/yard'] }),
		task('b4', 'Renew medical certificate', 'flying', { due: { at: day(5) }, priority: 3 }),
		task('b5', 'Plan the cross-country', 'flying', { schedule: on(3, '09:00') }),
		task('b6', 'Chart update', 'flying', { schedule: on(-1) }),
		task('b7', 'Call the dentist', 'inbox-ben'),
		task('b8', 'Water the plants', 'chores', { status: 'done', completedAt: `${today}T12:00:00.000Z`, sectionId: 's-in', schedule: on(0) }),
		task('b9', 'Replace furnace filter', 'chores', { schedule: on(2), sectionId: 's-in' }),
		task('b10', 'Rake leaves', 'chores', { schedule: on(2), sectionId: 's-out' }),
		task('b11', 'Pay the water bill', 'inbox-ben', { due: { at: day(2) }, priority: 2 }),
		task('b12', 'Logbook entries', 'flying', { schedule: on(6) }),
		task('b13', 'Order checklists', 'flying', { schedule: on(6) }),
		...householdTasks,
	];
	const sam = person('sam', 'sam', { ha_user: 'ha-sam' });
	sam.lists = [list('inbox-sam', 'Inbox', { isInbox: true }), list('garden', 'Garden', { color: '#8DAA9B' }), { ...shared, role: 'editor' }];
	sam.tasks = [
		task('s1', 'Order tulip bulbs', 'garden', { schedule: on(0), priority: 1 }),
		task('s2', 'Prune the roses', 'garden', { schedule: on(4) }),
		task('s3', 'Return library books', 'inbox-sam', { due: { at: day(1) } }),
		...householdTasks.map((t) => ({ ...t })),
	];
	return new FakeHass([ben, sam], 'ben');
}
