// What the PeckList integration's websocket commands answer, and the card's own configuration.

export interface TaskDate {
	at?: string;
	start?: string;
	end?: string | null;
	allDay?: boolean;
	timeZone?: string;
}

export interface Task {
	id: string;
	title: string;
	notes: string;
	listId: string | null;
	sectionId: string | null;
	parentId: string | null;
	status: 'open' | 'done' | 'wontdo';
	completedAt: string | null;
	priority: number;
	schedule: TaskDate | null;
	due: TaskDate | null;
	tags: string[];
	assignees: string[];
	recurrence: string | null;
	pinned?: boolean;
	createdAt: string | null;
}

export interface List {
	id: string;
	name: string;
	color: string | null;
	isInbox: boolean;
	shared: boolean;
	role: string | null;
}

export interface Section {
	id: string;
	listId: string | null;
	name: string;
}

export interface Tag {
	id: string;
	name: string;
	color: string | null;
}

export interface Account {
	entry_id: string;
	title: string;
	username: string;
	/** The Home Assistant user's name when the account is matched to one, else the username. */
	name?: string;
	user_id: string;
	can_write: boolean;
	ha_user: string | null;
}

export interface Snapshot {
	revision: number;
	account: Account;
	connected: boolean;
	live: boolean;
	completed_days: number;
	time_zone: string;
	lists: List[];
	sections: Section[];
	tags: Tag[];
	tasks: Task[];
}

export interface Accounts {
	version: number;
	accounts: Account[];
	mine: string | null;
}

export type View = 'glance' | 'list' | 'agenda' | 'heatmap';
export type Scope = 'all' | 'own' | 'assigned';
export type Sort = 'date' | 'priority' | 'title' | 'created';

export interface CardConfig {
	type: string;
	view?: View;
	title?: string;
	/** Config entry ids of the people to show. Empty: the signed-in person's own, else everyone. */
	entries?: string[];
	scope?: Scope;
	lists?: string[];
	tags?: string[];
	sort?: Sort;
	density?: 'comfortable' | 'compact';
	show_completed?: boolean;
	quick_add?: boolean;
	/** Wall tablet layout: big touch targets, nothing that needs a keyboard. */
	kiosk?: boolean;
	colors?: 'theme' | 'pecklist';
	/** A color per person, by config entry id: overrides the built-in ones. */
	person_colors?: Record<string, string>;
	/** At a glance: how many next tasks to list. */
	max_items?: number;
	/** Agenda: today and this many days after it. */
	days?: number;
	/** Heatmap: a month or a year. */
	range?: 'month' | 'year';
	/** Body height in pixels; 0 grows with its content. */
	height?: number;
}

/** A task as the card shows it: with its list, its day, and the account to write it through. */
export interface Item {
	task: Task;
	entryId: string;
	/** Entry ids of every shown account that can see this task. */
	seenBy: string[];
	/** Entry ids of whose task it is: the shown people it is assigned to, else everyone who sees it. */
	owners: string[];
	list: List | null;
	day: string | null;
	time: string | null;
	open: boolean;
	canWrite: boolean;
}

export interface HomeAssistant {
	callWS<T>(message: Record<string, unknown>): Promise<T>;
	connection: {
		subscribeMessage<T>(
			callback: (message: T) => void,
			message: Record<string, unknown>,
		): Promise<() => void>;
	};
	config?: { time_zone?: string };
	locale?: { language?: string; first_weekday?: string };
	language?: string;
	user?: { id: string; name: string };
}
