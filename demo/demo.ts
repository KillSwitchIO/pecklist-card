// The card over a stand-in for Home Assistant. Query string: ?theme=dark, ?only=<n> for one card.
import '../src/pecklist-card';
import { todayIn } from '../src/data';
import type { PeckListCard } from '../src/pecklist-card';
import type { CardConfig } from '../src/types';
import { household } from '../tests/fake-hass';

const params = new URLSearchParams(location.search);
if (params.get('theme') === 'dark') document.documentElement.dataset.theme = 'dark';

// Home Assistant's card frame, which the real frontend provides.
customElements.define(
	'ha-card',
	class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' }).innerHTML =
				'<style>:host{display:block;background:var(--card-background-color);border-radius:12px;border:1px solid var(--divider-color)}</style><slot></slot>';
		}
	},
);

const hass = household(todayIn('America/Chicago'));
const cards: Partial<CardConfig>[] = [
	{ view: 'glance', title: 'At a glance', quick_add: true },
	{ view: 'list', title: 'Chores', lists: ['chores'], show_completed: true },
	{ view: 'agenda', title: 'This week', entries: ['ben', 'sam'] },
	{ view: 'heatmap', title: 'Busy days', entries: ['ben', 'sam'] },
	{ view: 'heatmap', title: 'The year', range: 'year', colors: 'pecklist' },
	{ view: 'list', title: 'Everything', density: 'compact', colors: 'pecklist', entries: ['ben', 'sam'] },
	{ view: 'glance', title: 'Kitchen tablet', kiosk: true, quick_add: true, colors: 'pecklist', entries: ['ben', 'sam'], max_items: 4 },
	{ view: 'agenda', density: 'compact', days: 2, entries: ['ben', 'sam'], quick_add: true, height: 300 },
];
const only = params.get('only');
const main = document.getElementById('cards')!;
for (const [index, config] of cards.entries()) {
	if (only !== null && Number(only) !== index) continue;
	const card = document.createElement('pecklist-card') as PeckListCard;
	card.setConfig({ type: 'custom:pecklist-card', ...config });
	card.hass = hass;
	main.append(card);
}
