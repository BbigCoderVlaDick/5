// ─── Base Model ─────────────────────────────────────────────────────────────

export interface BaseEvent {
  readonly id: string;
  readonly createdAt: Date;
  title: string;
  description: string;
  date: Date;
  priority: "low" | "medium" | "high";
  tags: string[];
}

// ─── Specialized Event Types ─────────────────────────────────────────────────

export interface MeetingEvent extends BaseEvent {
  kind: "meeting";
  location: string;
  participants: string[];
  durationMinutes: number;
  isOnline: boolean;
  meetingLink?: string;
}

export interface TaskEvent extends BaseEvent {
  kind: "task";
  assignee: string;
  deadline: Date;
  status: "todo" | "in-progress" | "done" | "cancelled";
  estimatedHours: number;
  dependsOn?: string[]; // IDs of other tasks
}

export interface ReminderEvent extends BaseEvent {
  kind: "reminder";
  remindAt: Date;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly";
  acknowledged: boolean;
}

// ─── Discriminated Union ─────────────────────────────────────────────────────

export type AppEvent = MeetingEvent | TaskEvent | ReminderEvent;
export type EventKind = AppEvent["kind"];

// ─── Utility Types ───────────────────────────────────────────────────────────

// Omit service fields that are auto-generated on creation
type ServiceFields = "id" | "createdAt";

export type CreateMeetingEvent = Omit<MeetingEvent, ServiceFields>;
export type CreateTaskEvent = Omit<TaskEvent, ServiceFields>;
export type CreateReminderEvent = Omit<ReminderEvent, ServiceFields>;
export type CreateAppEvent = CreateMeetingEvent | CreateTaskEvent | CreateReminderEvent;

// Partial update — exclude immutable fields + kind (can't change event type)
export type UpdateMeetingEvent = Partial<Omit<MeetingEvent, ServiceFields | "kind">>;
export type UpdateTaskEvent = Partial<Omit<TaskEvent, ServiceFields | "kind">>;
export type UpdateReminderEvent = Partial<Omit<ReminderEvent, ServiceFields | "kind">>;

// Generic update type resolved by kind
export type UpdatePayload<K extends EventKind> =
  K extends "meeting" ? UpdateMeetingEvent :
  K extends "task" ? UpdateTaskEvent :
  K extends "reminder" ? UpdateReminderEvent :
  never;

// Typed dictionary grouped by event kind
export type EventRegistry = Record<EventKind, AppEvent[]>;

// Conditional type: resolve full event type from kind string
export type EventByKind<K extends EventKind> =
  K extends "meeting" ? MeetingEvent :
  K extends "task" ? TaskEvent :
  K extends "reminder" ? ReminderEvent :
  never;

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isMeetingEvent(event: AppEvent): event is MeetingEvent {
  return event.kind === "meeting";
}

export function isTaskEvent(event: AppEvent): event is TaskEvent {
  return event.kind === "task";
}

export function isReminderEvent(event: AppEvent): event is ReminderEvent {
  return event.kind === "reminder";
}

// ─── Custom Errors ───────────────────────────────────────────────────────────

export class EventNotFoundError extends Error {
  constructor(id: string) {
    super(`Event with id "${id}" not found`);
    this.name = "EventNotFoundError";
  }
}

export class InvalidEventDataError extends Error {
  constructor(message: string) {
    super(`Invalid event data: ${message}`);
    this.name = "InvalidEventDataError";
  }
}
