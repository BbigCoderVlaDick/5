/**
 * Generic function to find an element by its `id` field.
 * T must have at least { id: string }.
 */
export function findById<T extends { id: string }>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Generate a simple unique ID (timestamp + random suffix).
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
