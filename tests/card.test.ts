import { afterEach, describe, expect, it, vi } from 'vitest';
import { todayIn } from '../src/data';
import { PeckListCard } from '../src/pecklist-card';
import type { CardConfig } from '../src/types';
import { type FakeHass, household } from './fake-hass';

const TODAY = todayIn('America/Chicago');

async function settle(card: PeckListCard): Promise<void> {
	for (let i = 0; i < 6; i++) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		await card.updateComplete;
	}
}

async function mount(config: Partial<CardConfig> = {}, hass: FakeHass = household(TODAY)): Promise<{ card: PeckListCard; hass: FakeHass; root: ShadowRoot }> {
	const card = document.createElement('pecklist-card') as PeckListCard;
	card.setConfig({ type: 'custom:pecklist-card', ...config });
	card.hass = hass;
	document.body.append(card);
	await settle(card);
	return { card, hass, root: card.shadowRoot! };
}

const text = (root: ShadowRoot | Element, selector: string) => [...root.querySelectorAll(selector)].map((e) => e.textContent!.replace(/\s+/gu, ' ').trim());
const writes = (hass: FakeHass) => hass.calls.filter((c) => String(c.type).startsWith('pecklist/task/'));
const row = (root: ShadowRoot, title: string) => [...root.querySelectorAll('.row')].find((r) => r.querySelector('.name')!.textContent === title)!;

afterEach(() => {
	document.body.replaceChildren();
});

describe('the card', () => {
	it('registers itself for the card picker', () => {
		expect(customElements.get('pecklist-card')).toBe(PeckListCard);
		expect((window as unknown as { customCards: { type: string }[] }).customCards.map((c) => c.type)).toContain('pecklist-card');
		expect(PeckListCard.getConfigElement().localName).toBe('pecklist-card-editor');
		expect(() => new PeckListCard().setConfig({ type: 'x', view: 'kanban' as never })).toThrow(/Unknown view/u);
	});

	it("shows the signed-in person's own account at a glance", async () => {
		const { root, hass } = await mount({ title: 'Tasks' });
		expect(hass.calls.filter((c) => c.type === 'pecklist/subscribe').map((c) => c.entry_id)).toEqual(['ben']);
		expect(text(root, 'h2')).toEqual(['Tasks']);
		expect(text(root, '.count')).toEqual(['2 Overdue', '2 Today', '9 Upcoming']);
		expect(text(root, '.name')).toEqual(['Book the plumber', 'Chart update', 'Take out the bins', 'Empty the dishwasher', 'Groceries']);
		const late = text(root, '.meta .late');
		expect(late).toHaveLength(2);
		expect(late[1]).toBe('Yesterday');
		expect(root.querySelector('.people')).toBeNull();
	});

	it('a count filters the list below it', async () => {
		const { card, root } = await mount();
		(root.querySelector('.count.late') as HTMLElement).click();
		await settle(card);
		expect(text(root, '.name')).toEqual(['Book the plumber', 'Chart update']);
	});

	it('checks a task off in one tap, and reopens it', async () => {
		const { card, root, hass } = await mount({ show_completed: true, view: 'list', lists: ['chores'] });
		const check = () => row(root, 'Empty the dishwasher').querySelector('.check') as HTMLButtonElement;
		expect(check().getAttribute('aria-checked')).toBe('false');
		check().click();
		await card.updateComplete;
		expect(check().getAttribute('aria-checked')).toBe('true'); // at once, before the server answers
		await settle(card);
		expect(writes(hass)).toEqual([{ type: 'pecklist/task/complete', entry_id: 'ben', task_id: 'b1' }]);
		expect(check().getAttribute('aria-checked')).toBe('true');
		check().click();
		await settle(card);
		expect(writes(hass)[1]).toEqual({ type: 'pecklist/task/reopen', entry_id: 'ben', task_id: 'b1' });
		expect(check().getAttribute('aria-checked')).toBe('false');
	});

	it('a refused change puts the check back and says why', async () => {
		const { card, root, hass } = await mount();
		hass.fail = 'The API key may only read tasks.';
		(row(root, 'Chart update').querySelector('.check') as HTMLElement).click();
		await settle(card);
		expect(row(root, 'Chart update').querySelector('.check')!.getAttribute('aria-checked')).toBe('false');
		expect(text(root, '.problem')).toEqual(['The API key may only read tasks.']);
	});

	it('list view groups by list and section, with subtasks under their parent', async () => {
		const { root } = await mount({ view: 'list' });
		expect(text(root, 'h3')).toEqual(['Inbox', 'Chores · Inside', 'Chores · Outside', 'Flying', 'Household']);
		expect(text(root, 'ul ul .name')).toEqual(['Coffee beans', 'Milk']);
	});

	it('agenda view runs from overdue through the days ahead', async () => {
		const { root } = await mount({ view: 'agenda', days: 2 });
		expect(text(root, 'h3').map((h) => h.split(' · ')[0])).toEqual(['Overdue', 'Today', 'Tomorrow', expect.any(String)]);
	});

	it('heatmap view shades days, and a tap shows that day', async () => {
		const { card, root } = await mount({ view: 'heatmap' });
		const cells = [...root.querySelectorAll('.cell:not(.out)')] as HTMLElement[];
		expect(cells.length).toBeGreaterThanOrEqual(28);
		expect(root.querySelector('.cell.today')!.getAttribute('aria-pressed')).toBe('true');
		expect(text(root, '.name')).toEqual(['Take out the bins', 'Empty the dishwasher']);
		const busiest = cells.reduce((a, b) => (Number(b.style.getPropertyValue('--level')) > Number(a.style.getPropertyValue('--level')) ? b : a));
		expect(busiest.getAttribute('aria-label')).toMatch(/: 4 tasks$/u);
		busiest.click();
		await settle(card);
		expect(text(root, '.name')).toHaveLength(4);
		const label = text(root, '.nav strong')[0];
		(root.querySelector('[aria-label="Later"]') as HTMLElement).click();
		await settle(card);
		expect(text(root, '.nav strong')[0]).not.toBe(label);
	});

	it('several people: combined with a color each, and a button per person', async () => {
		const { card, root, hass } = await mount({
			entries: ['ben', 'sam'],
			view: 'list',
			lists: ['household', 'garden'],
			person_colors: { sam: '#123456' },
		});
		const whose = (title: string) => row(root, title).querySelector('.who');
		const colors = (title: string) => [...whose(title)!.querySelectorAll('i')].map((i) => i.style.background.toLowerCase());
		expect(hass.subscribers()).toBe(2);
		// Each button counts that person's open tasks.
		expect(text(root, '.chip')).toEqual(['All 7', 'Ben 4', 'Sam 6']);
		expect(root.querySelector('.chip')!.getAttribute('aria-pressed')).toBe('true');
		expect(text(root, '.name').filter((n) => n === 'Take out the bins')).toHaveLength(1);
		expect(text(root, 'h3')).toEqual(['Household', 'Garden']);
		// A stripe says whose task it is: the person it is assigned to, else everyone who can see it.
		expect(whose('Take out the bins')!.getAttribute('aria-label')).toBe('Sam');
		expect(whose('Book the plumber')!.getAttribute('aria-label')).toBe('Ben');
		expect(whose('Groceries')!.getAttribute('aria-label')).toBe('Ben, Sam');
		expect(colors('Groceries')).toEqual(['#4c8bf5', '#123456']);

		// Ben's button: only his, with no stripes to read.
		(root.querySelectorAll('.chip')[1] as HTMLElement).click();
		await settle(card);
		expect(text(root, 'h3')).toEqual(['Household']);
		expect(text(root, '.name')).toEqual(['Book the plumber', 'Groceries', 'Coffee beans', 'Milk']);
		expect(root.querySelector('.who')).toBeNull();
		// Tapping it again goes back to everyone.
		(root.querySelectorAll('.chip')[1] as HTMLElement).click();
		await settle(card);
		expect(text(root, 'h3')).toEqual(['Household', 'Garden']);
	});

	it("one person's button also narrows where quick add can put a task", async () => {
		const { card, root } = await mount({ entries: ['ben', 'sam'], quick_add: true, lists: ['chores', 'garden'] });
		const options = () => [...root.querySelectorAll('.add option')].map((o) => o.textContent);
		expect(options()).toEqual(['ben: Chores', 'sam: Garden']);
		(root.querySelectorAll('.chip')[2] as HTMLElement).click();
		await settle(card);
		expect(options()).toEqual(['Garden']);
		expect((root.querySelector('.add select') as HTMLSelectElement).hidden).toBe(true); // one place: no choice to make
	});

	it('quick add sends the line to the list the card is about', async () => {
		const { card, root, hass } = await mount({ quick_add: true, lists: ['chores'], view: 'list' });
		const input = root.querySelector('.add input') as HTMLInputElement;
		input.value = 'Sweep the porch today #home !high';
		root.querySelector('.add')!.dispatchEvent(new Event('submit', { cancelable: true }));
		await settle(card);
		expect(writes(hass)).toEqual([{ type: 'pecklist/task/quick_add', entry_id: 'ben', text: 'Sweep the porch today #home !high', list_id: 'chores' }]);
		expect(input.value).toBe('');
		expect(text(root, '.name')).toContain('Sweep the porch');
	});

	it('editing sends only the fields that changed', async () => {
		const { card, root, hass } = await mount({ view: 'list', lists: ['chores'] });
		(row(root, 'Mow the lawn').querySelector('.what') as HTMLElement).click();
		await settle(card);
		const form = root.querySelector('.scrim form')!;
		const [title, date] = form.querySelectorAll('input');
		expect([title!.value, date!.value]).toEqual(['Mow the lawn', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u)]);
		title!.value = 'Mow the front lawn';
		title!.dispatchEvent(new Event('input'));
		(form.querySelectorAll('.prio button')[3] as HTMLElement).click();
		await settle(card);
		form.dispatchEvent(new Event('submit', { cancelable: true }));
		await settle(card);
		expect(writes(hass)).toEqual([
			{ type: 'pecklist/task/update', entry_id: 'ben', task_id: 'b2', changes: { title: 'Mow the front lawn', priority: 3 } },
		]);
		expect(root.querySelector('.scrim')).toBeNull();
		expect(text(root, '.name')).toContain('Mow the front lawn');
	});

	it('deleting from the dialog', async () => {
		const { card, root, hass } = await mount({ view: 'list', lists: ['chores'] });
		(row(root, 'Rake leaves').querySelector('.what') as HTMLElement).click();
		await settle(card);
		(root.querySelector('.btn.danger') as HTMLElement).click();
		await settle(card);
		expect(writes(hass)).toEqual([{ type: 'pecklist/task/delete', entry_id: 'ben', task_id: 'b10' }]);
		expect(text(root, '.name')).not.toContain('Rake leaves');
	});

	it('a list you may only view cannot be checked or edited', async () => {
		const hass = household(TODAY);
		hass.people[0]!.lists.find((l) => l.id === 'household')!.role = 'viewer';
		const { card, root } = await mount({ view: 'list', lists: ['household'] }, hass);
		const bins = row(root, 'Take out the bins');
		expect((bins.querySelector('.check') as HTMLButtonElement).disabled).toBe(true);
		(bins.querySelector('.what') as HTMLElement).click();
		await settle(card);
		expect(root.querySelector('.scrim')).toBeNull();
	});

	it('wall tablet layout adds through Assist, with no text box', async () => {
		const { card, root } = await mount({ kiosk: true, quick_add: true });
		expect(card.hasAttribute('kiosk')).toBe(true);
		expect(root.querySelector('.add')).toBeNull();
		const heard = vi.fn();
		document.body.addEventListener('hass-action', (e) => heard((e as CustomEvent).detail));
		(root.querySelector('.voice') as HTMLElement).click();
		expect(heard).toHaveBeenCalledWith({ config: { tap_action: { action: 'assist', start_listening: true } }, action: 'tap' });
	});

	it('stops listening when it leaves the page, and starts again when it is back', async () => {
		const { card, hass } = await mount();
		expect(hass.subscribers()).toBe(1);
		card.remove();
		expect(hass.subscribers()).toBe(0);
		document.body.append(card);
		await settle(card);
		expect(hass.subscribers()).toBe(1);
	});

	it('says so when the integration is missing', async () => {
		const hass = household(TODAY);
		hass.callWS = () => Promise.reject({ code: 'unknown_command', message: 'Unknown command.' });
		const { root } = await mount({}, hass);
		expect(text(root, '.problem')[0]).toMatch(/integration is not set up/u);
	});
	it('a compact card folds the add box behind a + button', async () => {
		const { card, root } = await mount({ quick_add: true, density: 'compact', lists: ['chores'] });
		const add = () => root.querySelector('.add') as HTMLFormElement;
		expect(add().hidden).toBe(true);
		// One person: no person buttons, only the +.
		expect(root.querySelectorAll('.chip')).toHaveLength(1);
		const plus = root.querySelector('.chip.plus') as HTMLElement;
		expect(plus.getAttribute('aria-expanded')).toBe('false');
		plus.click();
		await settle(card);
		expect(plus.getAttribute('aria-expanded')).toBe('true');
		expect(add().hidden).toBe(false);
		plus.click();
		await settle(card);
		expect(add().hidden).toBe(true);
	});
	it('names an assignee who is not on the card, and assigns from the dialog', async () => {
		const { card, root, hass } = await mount({ view: 'list', lists: ['household', 'chores'] });
		// Ben's own card: the bins are Sam's to take out.
		expect(text(row(root, 'Take out the bins'), '.meta .to')).toEqual(['@Sam']);
		expect(text(row(root, 'Book the plumber'), '.meta .to')).toEqual([]);

		// A task in a shared list can be assigned; one in a list of your own has nobody to assign to.
		(row(root, 'Mow the lawn').querySelector('.what') as HTMLElement).click();
		await settle(card);
		expect(root.querySelector('.assign')).toBeNull();
		(root.querySelector('.scrim .btn:not(.danger):not(.primary)') as HTMLElement).click();
		await settle(card);

		(row(root, 'Groceries').querySelector('.what') as HTMLElement).click();
		await settle(card);
		const chips = [...root.querySelectorAll('.assign .chip')] as HTMLElement[];
		expect(chips.map((c) => [c.textContent!.trim(), c.getAttribute('aria-pressed')])).toEqual([
			['Me', 'false'],
			['Sam', 'false'],
		]);
		chips[1]!.click();
		await settle(card);
		root.querySelector('.scrim form')!.dispatchEvent(new Event('submit', { cancelable: true }));
		await settle(card);
		expect(writes(hass)).toEqual([
			{ type: 'pecklist/task/update', entry_id: 'ben', task_id: 'h3', changes: { assignees: ['user:u-sam'] } },
		]);
		expect(text(row(root, 'Groceries'), '.meta .to')).toEqual(['@Sam']);
	});
	it('week strip: seven days with a dot per open task, and a tap lists the day', async () => {
		const { card, root } = await mount({ view: 'week', entries: ['ben', 'sam'] });
		const days = [...root.querySelectorAll('.wday')] as HTMLElement[];
		expect(days).toHaveLength(7);
		expect(days[0]!.getAttribute('aria-pressed')).toBe('true');
		expect(days[0]!.classList.contains('today')).toBe(true);
		// Today: Ben's dishwasher, Sam's bins and tulip bulbs, each dot in its person's color.
		const dots = [...days[0]!.querySelectorAll('.dots i')] as HTMLElement[];
		expect(dots).toHaveLength(3);
		expect(new Set(dots.map((d) => d.style.background.toLowerCase()))).toEqual(new Set(['#4c8bf5', '#e0679a']));
		// Today also shows what is overdue; another day shows only its own.
		expect(text(root, 'h3')[0]).toBe('Overdue');
		days[2]!.click();
		await settle(card);
		expect(text(root, 'h3')).toHaveLength(1);
		expect(text(root, '.name')).toEqual(['Pay the water bill', 'Mow the lawn', 'Rake leaves', 'Replace furnace filter']);
		// A busy day says how many more than it has dots for.
		expect(days[2]!.querySelector('.dots em')).toBeNull();
		expect(days[2]!.getAttribute('aria-label')).toMatch(/: 4 tasks$/u);
	});

	it('next up: the most pressing task, done or put off in one tap', async () => {
		const { card, root, hass } = await mount({ view: 'next' });
		expect(text(root, '.hero-title')).toEqual(['Book the plumber']);
		expect(text(root, '.hero-more')).toEqual(['3 more due']);
		const [done, tomorrow] = [...root.querySelectorAll('.hero-actions .btn')] as HTMLElement[];
		tomorrow!.click();
		await settle(card);
		const moved = writes(hass)[0] as { type: string; changes: { due: { at: string } } };
		expect(moved.type).toBe('pecklist/task/update');
		expect(moved.changes.due.at > TODAY).toBe(true);
		expect(text(root, '.hero-title')).toEqual(['Chart update']);
		(root.querySelector('.hero-actions .btn.primary') as HTMLElement).click();
		await settle(card);
		expect(writes(hass)[1]).toEqual({ type: 'pecklist/task/complete', entry_id: 'ben', task_id: 'b6' });
		expect(text(root, '.hero-title')).toEqual(['Take out the bins']);
		expect(done).toBeTruthy();
	});

	it('family board: a column per person with their own tasks', async () => {
		const { root } = await mount({ view: 'board', entries: ['ben', 'sam'], lists: ['household', 'garden'] });
		expect(text(root, '.col h3')).toEqual(['Ben 4', 'Sam 6']);
		const columns = [...root.querySelectorAll('.col')];
		expect(text(columns[0]!, '.name')).toEqual(['Book the plumber', 'Groceries', 'Coffee beans', 'Milk']);
		expect(text(columns[1]!, '.name')).toContain('Take out the bins');
		// Columns say whose it is: no buttons and no stripes.
		expect(root.querySelector('.people')).toBeNull();
		expect(root.querySelector('.who')).toBeNull();
	});

	it('shopping list: ticked things drop to the bottom, and Clear takes them away', async () => {
		const { card, root, hass } = await mount({ view: 'shopping', lists: ['chores'] });
		expect(card.getAttribute('view')).toBe('shopping');
		expect(text(root, 'h3')).toEqual(['Inside', 'Outside', 'Done Clear 1']);
		(row(root, 'Rake leaves').querySelector('.check') as HTMLElement).click();
		await settle(card);
		expect(text(root, '.clear')).toEqual(['Clear 2']);
		(root.querySelector('.clear') as HTMLElement).click();
		await settle(card);
		expect(writes(hass).slice(1).map((w) => [w.type, w.task_id]).sort()).toEqual([
			['pecklist/task/delete', 'b10'],
			['pecklist/task/delete', 'b8'],
		]);
		expect(root.querySelector('.clear')).toBeNull();
		expect(text(root, '.name')).not.toContain('Rake leaves');
	});

	it('person tiles: counts per person, and a tap goes where the card says', async () => {
		const { card, root } = await mount({ view: 'tiles', entries: ['ben', 'sam'], navigation_path: '/tasks/home', quick_add: true });
		expect(text(root, '.tile')).toEqual(['Ben 1 today 2 late', 'Sam 2 today']);
		expect(root.querySelector('.add')).toBeNull();
		expect(root.querySelector('.people')).toBeNull();
		expect(card.getGridOptions().rows).toBe(1);
		const went = vi.fn();
		window.addEventListener('location-changed', went);
		(root.querySelector('.tile') as HTMLElement).click();
		expect(went).toHaveBeenCalledOnce();
		expect(location.pathname).toBe('/tasks/home');
	});
});
