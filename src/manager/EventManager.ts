import {
  AppEvent,
  CreateAppEvent,
  EventByKind,
  EventKind,
  EventNotFoundError,
  EventRegistry,
  InvalidEventDataError,
  UpdatePayload,
  isMeetingEvent,
  isReminderEvent,
  isTaskEvent,
} from "../models/events";
import { findById, generateId } from "../utils/helpers";

export class EventManager {
  private events: AppEvent[] = [];

  // ─── Validation ────────────────────────────────────────────────────────────

  private validate(data: CreateAppEvent): void {
    if (!data.title || data.title.trim() === "") {
      throw new InvalidEventDataError("title cannot be empty");
    }
    if (!data.date || isNaN(data.date.getTime())) {
      throw new InvalidEventDataError("date is invalid");
    }
    if (data.kind === "meeting") {
      if (!data.location || data.location.trim() === "") {
        throw new InvalidEventDataError("meeting location cannot be empty");
      }
      if (data.durationMinutes <= 0) {
        throw new InvalidEventDataError("meeting durationMinutes must be positive");
      }
    }
    if (data.kind === "task") {
      if (!data.assignee || data.assignee.trim() === "") {
        throw new InvalidEventDataError("task assignee cannot be empty");
      }
      if (data.estimatedHours <= 0) {
        throw new InvalidEventDataError("task estimatedHours must be positive");
      }
    }
    if (data.kind === "reminder") {
      if (!data.remindAt || isNaN(data.remindAt.getTime())) {
        throw new InvalidEventDataError("reminder remindAt date is invalid");
      }
    }
  }

  // ─── Add ───────────────────────────────────────────────────────────────────

  add(data: CreateAppEvent): AppEvent {
    this.validate(data);

    const base = {
      id: generateId(),
      createdAt: new Date(),
    };

    const event: AppEvent = { ...base, ...data } as AppEvent;
    this.events.push(event);
    return event;
  }

  // ─── Remove ───────────────────────────────────────────────────────────────

  remove(id: string): void {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new EventNotFoundError(id);
    this.events.splice(idx, 1);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update<K extends EventKind>(
    id: string,
    kind: K,
    payload: UpdatePayload<K>
  ): EventByKind<K> {
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new EventNotFoundError(id);

    const existing = this.events[idx];
    if (existing.kind !== kind) {
      throw new InvalidEventDataError(
        `Event "${id}" is of kind "${existing.kind}", not "${kind}"`
      );
    }

    const updated = { ...existing, ...payload } as AppEvent;
    this.events[idx] = updated;
    return updated as EventByKind<K>;
  }

  // ─── Get All ──────────────────────────────────────────────────────────────

  getAll(): readonly AppEvent[] {
    return this.events;
  }

  // ─── Get By Kind (generic) ────────────────────────────────────────────────

  getByKind<K extends EventKind>(kind: K): EventByKind<K>[] {
    return this.events.filter((e): e is EventByKind<K> => e.kind === kind);
  }

  // ─── Find By ID ───────────────────────────────────────────────────────────

  findById(id: string): AppEvent | undefined {
    return findById(this.events, id);
  }

  // ─── Filter (arbitrary predicate) ────────────────────────────────────────

  filter(predicate: (event: AppEvent) => boolean): AppEvent[] {
    return this.events.filter(predicate);
  }

  // ─── Grouped Registry ────────────────────────────────────────────────────

  toRegistry(): EventRegistry {
    const registry: EventRegistry = {
      meeting: [],
      task: [],
      reminder: [],
    };
    for (const event of this.events) {
      if (isMeetingEvent(event)) registry.meeting.push(event);
      else if (isTaskEvent(event)) registry.task.push(event);
      else if (isReminderEvent(event)) registry.reminder.push(event);
    }
    return registry;
  }

  // ─── Count ────────────────────────────────────────────────────────────────

  get count(): number {
    return this.events.length;
  }
}
