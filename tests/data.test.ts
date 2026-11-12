import { describe, expect, it } from 'vitest';
import {
	addDays,
	addMonths,
	agenda,
	byList,
	collect,
	dateChange,
	firstWeekday,
	glance,
	heatLevel,
	heatmap,
	nest,
	parseTags,
	relativeDay,
	todayIn,
	when,
} from '../src/data';
import { schema, tidy } from '../src/editor';
import type { CardConfig } from '../src/types';
import { household, task } from './fake-hass';

const TODAY = '2026-11-12';
const card = (extra: Partial<CardConfig> = {}): CardConfig => ({ type: 'custom:pecklist-card', ...extra });

function snapshots(who: ('ben' | 'sam')[] = ['ben']) {
	const hass = household(TODAY);
	return hass.people.filter((p) => who.includes(p.account.username as 'ben')).map((p) => hass.snapshot(p));
}
const titles = (items: { task: { title: string } }[]) => items.map((i) => i.task.title);

describe('days', () => {
	it('does date maths on plain days', () => {
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
		expect(addMonths('2026-11-30', 3)).toBe('2027-02-01');
	});

	it('names days near today, and dates the rest', () => {
		expect(relativeDay(TODAY, TODAY, 'en')).toBe('Today');
		expect(relativeDay('2026-11-13', TODAY, 'en')).toBe('Tomorrow');
		expect(relativeDay('2026-11-11', TODAY, 'en')).toBe('Yesterday');
		expect(relativeDay('2026-11-15', TODAY, 'en')).toBe('Sunday');
		expect(relativeDay('2026-11-30', TODAY, 'en')).toBe('Nov 30');
		expect(relativeDay('2027-01-05', TODAY, 'en')).toBe('Jan 5, 2027');
	});

	it("takes today from Home Assistant's zone, not the browser's", () => {
		const late = new Date('2026-11-13T04:30:00Z');
		expect(todayIn('America/Chicago', late)).toBe('2026-11-12');
		expect(todayIn('Asia/Tokyo', late)).toBe('2026-11-13');
		expect(todayIn('Not/AZone', late)).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
	});

	it('starts the week as Home Assistant says, else as the language does', () => {
		expect(firstWeekday('monday', 'en-US')).toBe(1);
		expect(firstWeekday('language', 'en-US')).toBe(0);
		expect(firstWeekday(undefined, 'de')).toBe(1);
	});
});

describe('a task and its date', () => {
	it('shows the due date first, then the scheduled start', () => {
		expect(when(task('a', 'A', 'l', { due: { at: '2026-11-15' }, schedule: { start: '2026-11-14T09:00' } }))).toEqual({
			day: '2026-11-15',
			time: null,
			field: 'due',
		});
		expect(when(task('a', 'A', 'l', { schedule: { start: '2026-11-14T09:00' } }))).toEqual({ day: '2026-11-14', time: '09:00', field: 'schedule' });
		expect(when(task('a', 'A', 'l'))).toEqual({ day: null, time: null, field: null });
	});

	it('writes a date back to the field it came from', () => {
		const due = task('a', 'A', 'l', { due: { at: '2026-11-15' } });
		expect(dateChange(due, '2026-11-20', null)).toEqual({ due: { at: '2026-11-20', allDay: true } });
		expect(dateChange(due, null, null)).toEqual({ due: null });
		const plain = task('a', 'A', 'l');
		expect(dateChange(plain, '2026-11-20', '08:30')).toEqual({ schedule: { start: '2026-11-20T08:30', end: null, allDay: false } });
		expect(dateChange(plain, null, null)).toEqual({});
	});

	it('reads typed tags', () => {
		expect(parseTags('home, #yard/front  home')).toEqual(['home', 'yard/front']);
		expect(parseTags(' , ')).toEqual([]);
	});
});

describe('collect', () => {
	it('shows open tasks sorted by date, undated last', () => {
		const items = collect(snapshots(), card());
		expect(titles(items).slice(0, 4)).toEqual(['Book the plumber', 'Chart update', 'Take out the bins', 'Empty the dishwasher']);
		expect(titles(items).at(-1)).toBe('Milk');
		expect(titles(items)).not.toContain('Water the plants');
		expect(titles(collect(snapshots(), card({ show_completed: true }))).at(-1)).toBe('Water the plants');
	});

	it('narrows by list, tag and scope', () => {
		expect(titles(collect(snapshots(), card({ lists: ['flying'], sort: 'title' })))).toEqual([
			'Chart update',
			'Logbook entries',
			'Order checklists',
			'Plan the cross-country',
			'Renew medical certificate',
		]);
		// A tag matches the tags under it.
		expect(titles(collect(snapshots(), card({ tags: ['Home'], sort: 'title' })))).toEqual([
			'Clean the gutters',
			'Empty the dishwasher',
			'Mow the lawn',
			'Take out the bins',
		]);
		expect(titles(collect(snapshots(), card({ scope: 'assigned' })))).toEqual(['Book the plumber']);
		expect(titles(collect(snapshots(['sam']), card({ scope: 'assigned' })))).toEqual(['Take out the bins']);
		// Sam's own lists: the shared Household list is someone else's.
		expect(titles(collect(snapshots(['sam']), card({ scope: 'own', sort: 'title' })))).toEqual(['Order tulip bulbs', 'Prune the roses', 'Return library books']);
	});

	it('shows a shared task once for several people, and remembers who sees it', () => {
		const items = collect(snapshots(['ben', 'sam']), card());
		const bins = items.filter((i) => i.task.id === 'h1');
		expect(bins).toHaveLength(1);
		expect(bins[0]!.people).toEqual(['ben', 'sam']);
		expect(items.find((i) => i.task.id === 's1')!.entryId).toBe('sam');
	});

	it('writes a shared task through an account that may change it', () => {
		const hass = household(TODAY);
		hass.people[0]!.lists.find((l) => l.id === 'household')!.role = 'viewer';
		const items = collect(hass.people.map((p) => hass.snapshot(p)), card());
		const bins = items.find((i) => i.task.id === 'h1')!;
		expect([bins.entryId, bins.canWrite]).toEqual(['sam', true]);
		// A read-only key makes everything read-only.
		hass.people[1]!.account.can_write = false;
		expect(collect(hass.people.map((p) => hass.snapshot(p)), card()).find((i) => i.task.id === 'h1')!.canWrite).toBe(false);
	});

	it('sorts by priority and by newest', () => {
		expect(titles(collect(snapshots(), card({ sort: 'priority' }))).slice(0, 2)).toEqual(['Book the plumber', 'Renew medical certificate']);
		const hass = household(TODAY);
		hass.people[0]!.tasks.push(task('new', 'Brand new', 'chores', { createdAt: '2026-11-12T10:00:00.000Z' }));
		expect(titles(collect([hass.snapshot(hass.people[0]!)], card({ sort: 'created' })))[0]).toBe('Brand new');
	});
});

describe('views', () => {
	const items = collect(snapshots(), card());

	it('at a glance: counts, and the next few with late ones first', () => {
		const summary = glance(items, TODAY, 7, 3);
		expect([summary.overdue.length, summary.today.length, summary.upcoming.length]).toEqual([2, 2, 9]);
		expect(titles(summary.next)).toEqual(['Book the plumber', 'Chart update', 'Take out the bins']);
		expect(glance(items, TODAY, 7, 0).next).toEqual([]);
	});

	it('list: a group per list and section, subtasks under their parent', () => {
		const snaps = snapshots();
		const groups = byList(items, snaps[0]!.lists, snaps[0]!.sections);
		expect(groups.map((g) => g.label)).toEqual(['Inbox', 'Chores · Inside', 'Chores · Outside', 'Flying', 'Household']);
		const householdRows = groups.at(-1)!.rows;
		expect(householdRows.map((r) => r.item.task.title)).toEqual(['Book the plumber', 'Take out the bins', 'Groceries']);
		expect(titles(householdRows[2]!.subtasks)).toEqual(['Coffee beans', 'Milk']);
	});

	it('a subtask whose parent is filtered out stands on its own', () => {
		const rows = nest(items.filter((i) => i.task.id !== 'h3'));
		expect(rows.map((r) => r.item.task.title)).toContain('Milk');
	});

	it('agenda: overdue, today even when empty, then days that have something', () => {
		const groups = agenda(items, TODAY, 7, 'en');
		expect(groups.map((g) => g.label)).toEqual([
			'Overdue',
			'Today · Nov 12',
			'Tomorrow · Nov 13',
			'Saturday · Nov 14',
			'Sunday · Nov 15',
			'Tuesday · Nov 17',
			'Wednesday · Nov 18',
		]);
		expect(groups[0]!.late).toBe(true);
		const empty = agenda([], TODAY, 7, 'en');
		expect(empty.map((g) => [g.label, g.rows.length])).toEqual([['Today · Nov 12', 0]]);
	});

	it('heatmap: whole weeks around the month, shaded by how busy each day is', () => {
		const weeks = heatmap(items, 'month', TODAY, 0);
		expect(weeks).toHaveLength(5);
		expect(weeks[0]![0]).toMatchObject({ day: '2026-11-01', inRange: true });
		expect(weeks.at(-1)!.at(-1)).toMatchObject({ day: '2026-12-05', inRange: false });
		const busy = weeks.flat().find((d) => d.day === '2026-11-14')!;
		expect([busy.count, busy.level]).toEqual([4, 3]);
		// Monday-first pads from the last days of October.
		expect(heatmap(items, 'month', TODAY, 1)[0]![0]).toMatchObject({ day: '2026-10-26', inRange: false });
		expect([0, 1, 2, 3, 4, 5, 6, 40].map(heatLevel)).toEqual([0, 1, 2, 2, 3, 3, 4, 4]);
	});

	it('heatmap: a year is 53 or 54 weeks', () => {
		const weeks = heatmap(items, 'year', TODAY, 0);
		expect(weeks.length).toBeGreaterThanOrEqual(53);
		expect(weeks.flat().filter((d) => d.inRange)).toHaveLength(365);
	});
});

describe('the editor', () => {
	it('offers only what the chosen view uses', () => {
		const names = (config: CardConfig, people = 1) =>
			schema(config, Array.from({ length: people }, (_, i) => ({ value: `${i}`, label: `${i}` })), [{ value: 'l', label: 'L' }], []).map((f) => f.name);
		expect(names(card())).toContain('max_items');
		expect(names(card({ view: 'heatmap' }))).toContain('range');
		expect(names(card({ view: 'heatmap' }))).not.toContain('days');
		expect(names(card({ view: 'agenda' }))).toContain('days');
		// People are a choice only when there is more than one; tags only when there are any.
		expect(names(card())).not.toContain('entries');
		expect(names(card(), 2)).toContain('entries');
		expect(names(card())).not.toContain('tags');
	});

	it('saves a short configuration', () => {
		expect(
			tidy(card({ view: 'glance', title: '', lists: [], days: 7, show_completed: false, height: 0, sort: 'priority', kiosk: true, view_: undefined } as never)),
		).toEqual({ type: 'custom:pecklist-card', sort: 'priority', kiosk: true });
	});
});
