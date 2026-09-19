/**
 * Deep snake_case <-> camelCase key conversion for JSON payloads. The backend
 * (Django REST Framework) speaks snake_case on the wire; the app's domain
 * models are camelCase. `http-client.ts` applies these at the network
 * boundary so nothing above it ever has to think about the wire format.
 */

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function camelToSnakeKey(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Recursively converts every object key in `value` from snake_case to camelCase. */
export function deepKeysToCamel(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepKeysToCamel);
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [snakeToCamelKey(key), deepKeysToCamel(val)])
    );
  }
  return value;
}

/** Recursively converts every object key in `value` from camelCase to snake_case. */
export function deepKeysToSnake(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepKeysToSnake);
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [camelToSnakeKey(key), deepKeysToSnake(val)])
    );
  }
  return value;
}
