import { css } from 'lit';

export const styles = css`
	:host {
		--pl-accent: var(--primary-color, #5a8a4e);
		--pl-high: var(--error-color, #d9776b);
		--pl-medium: var(--warning-color, #e3b068);
		--pl-low: var(--info-color, #8daa9b);
		--pl-none: var(--secondary-text-color, #8a8f98);
		--pl-late: var(--error-color, #d9776b);
		--pl-text: var(--primary-text-color, #1b1d1f);
		--pl-muted: var(--secondary-text-color, #6b7078);
		--pl-line: var(--divider-color, rgba(127, 127, 127, 0.25));
		--pl-surface: var(--card-background-color, #fff);
		--pl-row: 8px;
		--pl-check: 22px;
		--pl-font: 14px;
		display: block;
		height: 100%;
	}
	:host([colors='pecklist']) {
		--pl-accent: #5a8a4e;
		--pl-high: #d9776b;
		--pl-medium: #e3b068;
		--pl-low: #8daa9b;
		--pl-none: #b8bcc4;
		--pl-late: #d9776b;
	}
	:host([density='compact']) {
		--pl-row: 3px;
		--pl-check: 18px;
		--pl-font: 13px;
	}
	:host([kiosk]) {
		--pl-row: 14px;
		--pl-check: 34px;
		--pl-font: 19px;
	}
	ha-card {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		height: 100%;
		color: var(--pl-text);
		font-size: var(--pl-font);
		overflow: hidden;
	}
	button {
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
	}
	button:focus-visible,
	input:focus-visible,
	textarea:focus-visible,
	select:focus-visible {
		outline: 2px solid var(--pl-accent);
		outline-offset: 2px;
	}
	svg {
		width: 1.25em;
		height: 1.25em;
		fill: currentColor;
		flex: none;
	}

	header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px 6px;
	}
	h2 {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-size: 1.25em;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.state {
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.people {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 10px 12px 6px;
	}
	header + .people {
		padding-top: 2px;
	}
	.chip {
		--who: var(--pl-accent);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 12px;
		border: 1px solid var(--pl-line);
		border-radius: 999px;
		font-size: 0.9em;
		color: var(--pl-text);
		white-space: nowrap;
	}
	.chip b {
		font-weight: 500;
		color: var(--pl-muted);
	}
	.chip .dot {
		background: var(--who);
	}
	:host([kiosk]) .chip {
		min-height: 48px;
		padding: 0 18px;
	}
	.chip[aria-pressed='true'] {
		border-color: var(--who);
		background: color-mix(in srgb, var(--who) 18%, transparent);
		box-shadow: inset 0 0 0 1px var(--who);
	}
	.chip[aria-pressed='true'] b {
		color: inherit;
	}
	.people .grow {
		flex: 1;
	}
	.chip.plus {
		justify-content: center;
		width: 32px;
		padding: 0;
		color: var(--pl-muted);
	}
	:host([kiosk]) .chip.plus {
		width: 48px;
	}
	.chip.plus[aria-expanded='true'] {
		border-color: var(--pl-accent);
		color: var(--pl-accent);
	}
	.who {
		display: flex;
		flex-direction: column;
		align-self: stretch;
		width: 4px;
		margin: 1px -4px 1px 0;
		border-radius: 2px;
		overflow: hidden;
		flex: none;
	}
	.who i {
		flex: 1;
	}

	.add {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 4px 16px 8px;
		padding: 0 10px;
		border: 1px solid var(--pl-line);
		border-radius: 10px;
		color: var(--pl-muted);
	}
	.add[hidden],
	.add select[hidden] {
		display: none;
	}
	.add:focus-within {
		border-color: var(--pl-accent);
	}
	.add input {
		flex: 1;
		min-width: 0;
		padding: 9px 0;
		font: inherit;
		color: var(--pl-text);
		background: none;
		border: 0;
		outline: 0;
	}
	.add select {
		max-width: 40%;
		font: inherit;
		color: var(--pl-muted);
		background: none;
		border: 0;
	}
	.voice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin: 6px 16px 10px;
		padding: 16px;
		border-radius: 16px;
		background: var(--pl-accent);
		color: var(--text-primary-color, #fff);
		font-size: 1.1em;
		font-weight: 500;
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0 8px 10px;
	}
	.empty,
	.problem {
		padding: 18px 8px;
		text-align: center;
		color: var(--pl-muted);
	}
	.problem {
		color: var(--pl-late);
	}

	.counts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 4px 8px 10px;
	}
	.count {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 4px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--pl-accent) 10%, transparent);
	}
	.count[aria-pressed='true'] {
		box-shadow: inset 0 0 0 2px var(--pl-accent);
	}
	.count b {
		font-size: 1.9em;
		font-weight: 500;
		line-height: 1.1;
	}
	.count span {
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.count.late b {
		color: var(--pl-late);
	}
	.count.late.none b {
		color: inherit;
	}

	h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 10px 8px 2px;
		font-size: 0.85em;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--pl-muted);
	}
	h3.late {
		color: var(--pl-late);
	}
	.dot {
		width: 0.7em;
		height: 0.7em;
		border-radius: 50%;
		background: var(--pl-accent);
		flex: none;
	}
	.none-today {
		padding: 2px 8px 6px;
		color: var(--pl-muted);
		font-size: 0.9em;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	ul ul {
		margin-left: calc(var(--pl-check) + 10px);
	}
	.row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: var(--pl-row) 8px;
		border-radius: 8px;
	}
	.row:hover {
		background: color-mix(in srgb, var(--pl-text) 5%, transparent);
	}
	.check {
		display: grid;
		place-items: center;
		width: var(--pl-check);
		height: var(--pl-check);
		margin-top: 1px;
		border: 2px solid var(--pl-none);
		border-radius: 50%;
		flex: none;
		color: transparent;
	}
	.check.p1 {
		border-color: var(--pl-low);
	}
	.check.p2 {
		border-color: var(--pl-medium);
	}
	.check.p3 {
		border-color: var(--pl-high);
	}
	.check svg {
		width: 70%;
		height: 70%;
	}
	.check.closed {
		background: var(--pl-none);
		border-color: var(--pl-none);
		color: var(--pl-surface);
	}
	.check:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.what {
		flex: 1;
		min-width: 0;
		text-align: left;
	}
	.what:disabled {
		cursor: default;
	}
	.name {
		display: block;
		overflow-wrap: anywhere;
	}
	.closed + .what .name {
		color: var(--pl-muted);
		text-decoration: line-through;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px 10px;
		margin-top: 1px;
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.meta .late {
		color: var(--pl-late);
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.meta svg {
		width: 1em;
		height: 1em;
	}

	/* Dense rows: one line each, the date at the right, so a section cell shows more tasks. */
	:host([density='compact']) .what {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	:host([density='compact']) .name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:host([density='compact']) .meta {
		flex: none;
		flex-wrap: nowrap;
		margin: 0;
	}
	:host([density='compact']) .meta .tag {
		display: none;
	}
	:host([density='compact']) .counts {
		gap: 6px;
		padding-bottom: 6px;
	}
	:host([density='compact']) .count {
		flex-direction: row;
		justify-content: center;
		align-items: baseline;
		gap: 6px;
		padding: 5px 4px;
	}
	:host([density='compact']) .count b {
		font-size: 1.3em;
	}
	:host([density='compact']) h3 {
		margin-top: 6px;
	}
	.groups section {
		break-inside: avoid;
	}
	/* A narrow cell (a third of a phone, a small section): the list's name gives way to the task. */
	@container (max-width: 330px) {
		:host([density='compact']) .meta .in {
			display: none;
		}
		header {
			padding: 10px 12px 4px;
		}
	}
	/* A wide cell (a card across two or three sections): groups side by side. */
	@container (min-width: 680px) {
		.groups {
			columns: 2;
			column-gap: 16px;
		}
	}
	@container (min-width: 1040px) {
		.groups {
			columns: 3;
		}
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px 6px;
	}
	.nav strong {
		flex: 1;
		font-weight: 500;
	}
	.nav button {
		display: grid;
		place-items: center;
		width: 2.2em;
		height: 2.2em;
		border-radius: 50%;
	}
	.nav button:hover {
		background: color-mix(in srgb, var(--pl-text) 8%, transparent);
	}
	.heat {
		display: grid;
		gap: 3px;
		padding: 0 8px 8px;
	}
	.heat {
		grid-template-columns: repeat(7, 1fr);
	}
	.year {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
		gap: 12px 14px;
		padding: 0 8px 8px;
	}
	.month-name {
		margin-bottom: 3px;
		color: var(--pl-muted);
		font-size: 0.8em;
	}
	.heat.small {
		gap: 2px;
		padding: 0;
	}
	.heat .wd {
		text-align: center;
		color: var(--pl-muted);
		font-size: 0.75em;
	}
	.cell {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		min-width: 0;
		border-radius: 6px;
		background: color-mix(in srgb, var(--pl-accent) calc(var(--level) * 22%), color-mix(in srgb, var(--pl-text) 6%, transparent));
		font-size: 0.85em;
	}
	.heat.small .cell {
		border-radius: 3px;
		font-size: 0;
	}
	:host([kiosk]) .heat.small .cell {
		border-radius: 5px;
	}
	.cell.l3,
	.cell.l4 {
		color: var(--text-primary-color, #fff);
	}
	.cell.out {
		visibility: hidden;
	}
	.cell.today {
		box-shadow: inset 0 0 0 2px var(--pl-text);
	}
	.cell[aria-pressed='true'] {
		box-shadow: inset 0 0 0 2px var(--pl-accent), 0 0 0 1px var(--pl-accent);
	}
	.legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 3px;
		padding: 0 8px 4px;
		color: var(--pl-muted);
		font-size: 0.75em;
	}
	.legend i {
		width: 1em;
		height: 1em;
		border-radius: 3px;
		background: color-mix(in srgb, var(--pl-accent) calc(var(--level) * 22%), color-mix(in srgb, var(--pl-text) 6%, transparent));
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: 8;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.45);
	}
	.scrim form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: min(440px, 100%);
		max-height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		padding: 18px;
		border-radius: 16px;
		background: var(--pl-surface);
		color: var(--pl-text);
		font-size: 14px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.scrim input,
	.scrim textarea {
		padding: 9px 10px;
		border: 1px solid var(--pl-line);
		border-radius: 8px;
		font: inherit;
		font-size: 14px;
		color: var(--pl-text);
		background: none;
		color-scheme: light dark;
	}
	.scrim textarea {
		min-height: 4.5em;
		resize: vertical;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.prio {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}
	.prio button {
		padding: 7px 0;
		border: 1px solid var(--pl-line);
		border-radius: 8px;
		color: var(--pl-text);
	}
	.prio button[aria-pressed='true'] {
		border-color: var(--pl-accent);
		box-shadow: inset 0 0 0 1px var(--pl-accent);
	}
	.actions {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}
	.actions .grow {
		flex: 1;
	}
	.btn {
		padding: 9px 16px;
		border-radius: 8px;
		font-weight: 500;
	}
	.btn.primary {
		background: var(--pl-accent);
		color: var(--text-primary-color, #fff);
	}
	.btn.danger {
		color: var(--pl-late);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.error {
		color: var(--pl-late);
		font-size: 0.9em;
	}
`;

export const icons = {
	check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
	plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
	mic: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3m5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z',
	left: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
	right: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
	repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z',
	today: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V9h14zM7 11h5v5H7z',
};
