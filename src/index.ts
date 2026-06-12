import { EventManager } from "./manager/EventManager";
import {
  EventNotFoundError,
  InvalidEventDataError,
  isMeetingEvent,
  isReminderEvent,
  isTaskEvent,
} from "./models/events";

const manager = new EventManager();

// ─── Separator helpers ────────────────────────────────────────────────────────
const sep = (title: string) =>
  console.log(`\n${"═".repeat(60)}\n  ${title}\n${"═".repeat(60)}`);

const sub = (title: string) => console.log(`\n── ${title} ──`);

// ─── Add 9+ events ───────────────────────────────────────────────────────────
sep("1. ДОДАВАННЯ ПОДІЙ");

const e1 = manager.add({
  kind: "meeting",
  title: "Kick-off зустріч",
  description: "Початок нового проєкту з командою",
  date: new Date("2025-06-10T09:00:00"),
  priority: "high",
  tags: ["project", "team"],
  location: "Конференц-зал A",
  participants: ["Іван", "Олена", "Максим"],
  durationMinutes: 60,
  isOnline: false,
});

const e2 = manager.add({
  kind: "meeting",
  title: "Онлайн-ретроспектива",
  description: "Підбиваємо підсумки спринту",
  date: new Date("2025-06-17T15:00:00"),
  priority: "medium",
  tags: ["scrum", "retrospective"],
  location: "Google Meet",
  participants: ["Іван", "Олена", "Тарас", "Юлія"],
  durationMinutes: 90,
  isOnline: true,
  meetingLink: "https://meet.google.com/abc-defg-hij",
});

const e3 = manager.add({
  kind: "task",
  title: "Реалізувати модуль авторизації",
  description: "JWT + refresh tokens",
  date: new Date("2025-06-15T00:00:00"),
  priority: "high",
  tags: ["backend", "security"],
  assignee: "Іван",
  deadline: new Date("2025-06-20T00:00:00"),
  status: "in-progress",
  estimatedHours: 12,
});

const e4 = manager.add({
  kind: "task",
  title: "Написати unit-тести для EventManager",
  description: "Покриття не менше 80%",
  date: new Date("2025-06-16T00:00:00"),
  priority: "medium",
  tags: ["testing", "typescript"],
  assignee: "Олена",
  deadline: new Date("2025-06-22T00:00:00"),
  status: "todo",
  estimatedHours: 6,
  dependsOn: [e3.id],
});

const e5 = manager.add({
  kind: "task",
  title: "Оновити документацію API",
  description: "Swagger + README",
  date: new Date("2025-06-18T00:00:00"),
  priority: "low",
  tags: ["docs"],
  assignee: "Максим",
  deadline: new Date("2025-06-25T00:00:00"),
  status: "todo",
  estimatedHours: 3,
});

const e6 = manager.add({
  kind: "reminder",
  title: "Здати практичну роботу №5",
  description: "TypeScript Advanced — EventManager",
  date: new Date("2025-06-19T08:00:00"),
  priority: "high",
  tags: ["university", "deadline"],
  remindAt: new Date("2025-06-19T07:00:00"),
  isRecurring: false,
  acknowledged: false,
});

const e7 = manager.add({
  kind: "reminder",
  title: "Щотижневий stand-up",
  description: "Нагадування про щотижневий мітинг",
  date: new Date("2025-06-09T09:45:00"),
  priority: "low",
  tags: ["scrum", "recurring"],
  remindAt: new Date("2025-06-09T09:30:00"),
  isRecurring: true,
  recurrenceInterval: "weekly",
  acknowledged: false,
});

const e8 = manager.add({
  kind: "task",
  title: "Провести code review",
  description: "Переглянути PR від Олени",
  date: new Date("2025-06-14T12:00:00"),
  priority: "medium",
  tags: ["review"],
  assignee: "Іван",
  deadline: new Date("2025-06-14T18:00:00"),
  status: "done",
  estimatedHours: 2,
});

const e9 = manager.add({
  kind: "meeting",
  title: "Демо для замовника",
  description: "Показуємо результати першого спринту",
  date: new Date("2025-06-24T11:00:00"),
  priority: "high",
  tags: ["client", "demo"],
  location: "Zoom",
  participants: ["Іван", "Максим", "Клієнт"],
  durationMinutes: 45,
  isOnline: true,
  meetingLink: "https://zoom.us/j/123456789",
});

// Bonus 10th event
const e10 = manager.add({
  kind: "reminder",
  title: "Оновити залежності проєкту",
  description: "npm update + audit fix",
  date: new Date("2025-06-30T10:00:00"),
  priority: "low",
  tags: ["maintenance"],
  remindAt: new Date("2025-06-30T09:00:00"),
  isRecurring: true,
  recurrenceInterval: "monthly",
  acknowledged: false,
});

console.log(`Додано ${manager.count} подій`);

// ─── List all ─────────────────────────────────────────────────────────────────
sep("2. СПИСОК УСІХ ПОДІЙ");
manager.getAll().forEach((e, i) => {
  console.log(`  ${i + 1}. [${e.kind.toUpperCase()}] ${e.title} | prio: ${e.priority} | ${e.date.toLocaleDateString("uk-UA")}`);
});

// ─── Get by kind ──────────────────────────────────────────────────────────────
sep("3. ПОДІЇ ЗА ТИПОМ");

sub("Meetings");
manager.getByKind("meeting").forEach((m) => {
  console.log(`  • ${m.title} @ ${m.location} (${m.durationMinutes} хв) | онлайн: ${m.isOnline}`);
});

sub("Tasks");
manager.getByKind("task").forEach((t) => {
  console.log(`  • ${t.title} → ${t.assignee} | статус: ${t.status} | ~${t.estimatedHours}год`);
});

sub("Reminders");
manager.getByKind("reminder").forEach((r) => {
  console.log(`  • ${r.title} | повтор: ${r.isRecurring ? r.recurrenceInterval : "ні"} | підтв: ${r.acknowledged}`);
});

// ─── Filter ───────────────────────────────────────────────────────────────────
sep("4. ФІЛЬТРАЦІЯ ПОДІЙ");

sub("High priority events");
manager.filter((e) => e.priority === "high").forEach((e) => {
  console.log(`  • [${e.kind}] ${e.title}`);
});

sub("Upcoming tasks (status: todo or in-progress)");
manager
  .filter((e) => isTaskEvent(e) && (e.status === "todo" || e.status === "in-progress"))
  .forEach((e) => {
    if (isTaskEvent(e)) console.log(`  • ${e.title} | ${e.status} | виконавець: ${e.assignee}`);
  });

sub("Events tagged 'scrum'");
manager.filter((e) => e.tags.includes("scrum")).forEach((e) => {
  console.log(`  • [${e.kind}] ${e.title}`);
});

// ─── Type guards demo ─────────────────────────────────────────────────────────
sep("5. TYPE GUARDS");
manager.getAll().forEach((e) => {
  if (isMeetingEvent(e)) {
    console.log(`  [MEETING] "${e.title}" — учасники: ${e.participants.join(", ")}`);
  } else if (isTaskEvent(e)) {
    console.log(`  [TASK]    "${e.title}" — дедлайн: ${e.deadline.toLocaleDateString("uk-UA")}`);
  } else if (isReminderEvent(e)) {
    console.log(`  [REMIND]  "${e.title}" — нагадати о ${e.remindAt.toLocaleTimeString("uk-UA")}`);
  }
});

// ─── Update ───────────────────────────────────────────────────────────────────
sep("6. ОНОВЛЕННЯ ПОДІЇ");

const e4snap = manager.findById(e4.id);
const e4status = isTaskEvent(e4snap!) ? e4snap!.status : "?";
console.log(`\nДо оновлення: "${e4.title}" | статус: ${e4status}`);
const updated = manager.update(e4.id, "task", { status: "in-progress", assignee: "Тарас" });
console.log(`Після оновлення: "${updated.title}" | статус: ${updated.status} | виконавець: ${updated.assignee}`);

const e6snapVal = manager.findById(e6.id);
const e6ack = isReminderEvent(e6snapVal!) ? e6snapVal!.acknowledged : "?";
console.log(`\nДо оновлення: "${e6.title}" | acknowledged: ${e6ack}`);
const updatedReminder = manager.update(e6.id, "reminder", { acknowledged: true });
console.log(`Після оновлення: "${updatedReminder.title}" | acknowledged: ${updatedReminder.acknowledged}`);

// ─── Remove ───────────────────────────────────────────────────────────────────
sep("7. ВИДАЛЕННЯ ПОДІЇ");

console.log(`\nПодій до видалення: ${manager.count}`);
console.log(`Видаляємо: "${e5.title}"`);
manager.remove(e5.id);
console.log(`Подій після видалення: ${manager.count}`);

// ─── Registry (grouped) ───────────────────────────────────────────────────────
sep("8. РЕЄСТР (згруповано за типом)");

const registry = manager.toRegistry();
(Object.entries(registry) as [string, typeof registry[keyof typeof registry]][]).forEach(([kind, events]) => {
  console.log(`\n  ${kind.toUpperCase()} (${events.length}):`);
  events.forEach((e) => console.log(`    – ${e.title}`));
});

// ─── findById utility ─────────────────────────────────────────────────────────
sep("9. ПОШУК ЗА ID");

const found = manager.findById(e1.id);
console.log(`\nПошук id=${e1.id.slice(0, 16)}...`);
console.log(found ? `  Знайдено: "${found.title}"` : "  Не знайдено");

const notFound = manager.findById("non-existent-id");
console.log(`\nПошук неіснуючого id:`);
console.log(notFound ? `  Знайдено: "${notFound.title}"` : "  Не знайдено");

// ─── Error handling ───────────────────────────────────────────────────────────
sep("10. ОБРОБКА ПОМИЛОК");

sub("Оновлення неіснуючої події");
try {
  manager.update("fake-id", "task", { status: "done" });
} catch (err) {
  if (err instanceof EventNotFoundError) console.log(`  ✓ EventNotFoundError: ${err.message}`);
}

sub("Видалення неіснуючої події");
try {
  manager.remove("another-fake-id");
} catch (err) {
  if (err instanceof EventNotFoundError) console.log(`  ✓ EventNotFoundError: ${err.message}`);
}

sub("Невалідні дані при створенні (порожній title)");
try {
  manager.add({
    kind: "meeting",
    title: "",
    description: "test",
    date: new Date(),
    priority: "low",
    tags: [],
    location: "Room 1",
    participants: [],
    durationMinutes: 30,
    isOnline: false,
  });
} catch (err) {
  if (err instanceof InvalidEventDataError) console.log(`  ✓ InvalidEventDataError: ${err.message}`);
}

sub("Невалідні дані при створенні (від'ємна тривалість)");
try {
  manager.add({
    kind: "meeting",
    title: "Test",
    description: "test",
    date: new Date(),
    priority: "low",
    tags: [],
    location: "Room 1",
    participants: [],
    durationMinutes: -5,
    isOnline: false,
  });
} catch (err) {
  if (err instanceof InvalidEventDataError) console.log(`  ✓ InvalidEventDataError: ${err.message}`);
}

sep("ЗАВЕРШЕНО");
console.log(`  Фінальна кількість подій у менеджері: ${manager.count}\n`);
