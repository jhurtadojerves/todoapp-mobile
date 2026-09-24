import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAuthSession } from '@/presentation/hooks/use-auth-session';
import { mockRouter, resetMockRouter } from '@/test-utils/expo-router-mock';
import { makeJwt } from '@/test-utils/fixtures';

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockRefresh = jest.fn();

jest.mock('@/shared/di/dependencies', () => ({
  dependencies: {
    loginUseCase: { execute: (...args: unknown[]) => mockLogin(...args) },
    registerUseCase: { execute: (...args: unknown[]) => mockRegister(...args) },
    refreshTokenUseCase: { execute: (...args: unknown[]) => mockRefresh(...args) },
  },
}));

const mockStore = new Map<string, string>();
jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    deleteItem: jest.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  },
}));

const mockRegisterAuthHooks = jest.fn();
jest.mock('@/shared/api/http-client', () => ({
  registerAuthHooks: (...args: unknown[]) => mockRegisterAuthHooks(...args),
}));

jest.mock('expo-router', () => require('@/test-utils/expo-router-mock'));

type AuthHooks = {
  refreshAccessToken: () => Promise<string | null>;
  onUnauthorized: () => void;
  maxRefreshRetries: number;
};

function latestAuthHooks(): AuthHooks {
  const calls = mockRegisterAuthHooks.mock.calls.filter(([hooks]) => hooks !== null);
  return calls[calls.length - 1][0];
}

const access = makeJwt({ user_id: 42 });
const tokens = { access, refresh: 'refresh-1' };

describe('useAuthSession', () => {
  beforeEach(() => {
    mockStore.clear();
    jest.clearAllMocks();
    resetMockRouter();
  });

  it('should start unauthenticated when nothing is stored', async () => {
    const { result } = await renderHook(() => useAuthSession());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userId).toBeNull();
  });

  it('should restore a stored session on mount', async () => {
    mockStore.set('accessToken', access);
    mockStore.set('refreshToken', 'refresh-1');

    const { result } = await renderHook(() => useAuthSession());

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.refreshToken).toBe('refresh-1');
  });

  it('should not restore a half-stored session (access token without refresh token)', async () => {
    mockStore.set('accessToken', access);

    const { result } = await renderHook(() => useAuthSession());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should log in, persist both tokens and expose the user id from the JWT', async () => {
    mockLogin.mockResolvedValue(tokens);
    const { result } = await renderHook(() => useAuthSession());

    await act(() => result.current.login({ email: 'a@b.com', password: 'secret' }));

    expect(mockLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userId).toBe(42);
    expect(mockStore.get('accessToken')).toBe(access);
    expect(mockStore.get('refreshToken')).toBe('refresh-1');
  });

  it('should propagate a login failure and reset isAuthenticating', async () => {
    mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = await renderHook(() => useAuthSession());

    await act(async () => {
      await expect(result.current.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow(
        'Credenciales inválidas'
      );
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('should register and then log in with the same credentials', async () => {
    mockRegister.mockResolvedValue({ id: 1 });
    mockLogin.mockResolvedValue(tokens);
    const { result } = await renderHook(() => useAuthSession());
    const credentials = {
      username: 'ana',
      email: 'ana@example.com',
      password: 'Str0ng!pass',
      password2: 'Str0ng!pass',
      firstName: 'Ana',
      lastName: 'Pérez',
    };

    await act(() => result.current.register(credentials));

    expect(mockRegister).toHaveBeenCalledWith(credentials);
    expect(mockLogin).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'Str0ng!pass' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should clear tokens from state and storage on logout', async () => {
    mockLogin.mockResolvedValue(tokens);
    const { result } = await renderHook(() => useAuthSession());
    await act(() => result.current.login({ email: 'a@b.com', password: 'secret' }));

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(mockStore.has('accessToken')).toBe(false);
    expect(mockStore.has('refreshToken')).toBe(false);
  });

  it('should register auth hooks for the http client with a single refresh retry', async () => {
    await renderHook(() => useAuthSession());

    expect(latestAuthHooks().maxRefreshRetries).toBe(1);
  });

  it('should unregister the auth hooks on unmount', async () => {
    const { unmount } = await renderHook(() => useAuthSession());

    await unmount();

    expect(mockRegisterAuthHooks).toHaveBeenLastCalledWith(null);
  });

  describe('token refresh', () => {
    beforeEach(() => {
      mockStore.set('accessToken', access);
      mockStore.set('refreshToken', 'refresh-1');
    });

    it('should resolve null without calling the API when there is no refresh token', async () => {
      mockStore.clear();
      await renderHook(() => useAuthSession());

      await expect(latestAuthHooks().refreshAccessToken()).resolves.toBeNull();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should refresh and persist the rotated tokens', async () => {
      const newAccess = makeJwt({ user_id: 42, v: 2 });
      mockRefresh.mockResolvedValue({ access: newAccess, refresh: 'refresh-2' });
      const { result } = await renderHook(() => useAuthSession());
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      let refreshed: string | null = null;
      await act(async () => {
        refreshed = await latestAuthHooks().refreshAccessToken();
      });

      expect(mockRefresh).toHaveBeenCalledWith('refresh-1');
      expect(refreshed).toBe(newAccess);
      expect(mockStore.get('refreshToken')).toBe('refresh-2');
      expect(result.current.token).toBe(newAccess);
    });

    it('should de-duplicate concurrent refreshes into a single API call', async () => {
      let resolveRefresh!: (value: { access: string; refresh: string }) => void;
      mockRefresh.mockReturnValue(new Promise((resolve) => (resolveRefresh = resolve)));
      const { result } = await renderHook(() => useAuthSession());
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
      const hooks = latestAuthHooks();

      let results: (string | null)[] = [];
      await act(async () => {
        const first = hooks.refreshAccessToken();
        const second = hooks.refreshAccessToken();
        resolveRefresh({ access: 'new-access', refresh: 'refresh-2' });
        results = await Promise.all([first, second]);
      });

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(results).toEqual(['new-access', 'new-access']);
    });

    it('should end the session when the refresh itself fails', async () => {
      mockRefresh.mockRejectedValue(new Error('Token is invalid or expired'));
      const { result } = await renderHook(() => useAuthSession());
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      let refreshed: string | null = 'unset';
      await act(async () => {
        refreshed = await latestAuthHooks().refreshAccessToken();
      });

      expect(refreshed).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockStore.has('accessToken')).toBe(false);
    });

    it('should clear the session and send the user to /boards when unauthorized', async () => {
      const { result } = await renderHook(() => useAuthSession());
      await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

      await act(async () => {
        latestAuthHooks().onUnauthorized();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(mockRouter.replace).toHaveBeenCalledWith('/boards');
    });
  });
});
