/**
 * In-memory stand-in for expo-secure-store, so tests exercise the real
 * `storage` wrapper (and everything reading tokens through it) end to end.
 * Use with: jest.mock('expo-secure-store', () => require('@/test-utils/secure-store-mock'));
 */
const store = new Map<string, string>();

export const getItemAsync = jest.fn(async (key: string) => store.get(key) ?? null);

export const setItemAsync = jest.fn(async (key: string, value: string) => {
  store.set(key, value);
});

export const deleteItemAsync = jest.fn(async (key: string) => {
  store.delete(key);
});

export function __resetSecureStore(initial: Record<string, string> = {}): void {
  store.clear();
  for (const [key, value] of Object.entries(initial)) {
    store.set(key, value);
  }
}

export function __getSecureStoreSnapshot(): Record<string, string> {
  return Object.fromEntries(store);
}
