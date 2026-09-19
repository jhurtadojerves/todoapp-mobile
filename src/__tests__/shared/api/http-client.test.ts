import MockAdapter from 'axios-mock-adapter';

import {
  apiClient,
  apiFetch,
  ApiError,
  NetworkError,
  ServerError,
  TimeoutError,
  registerAuthHooks,
} from '@/shared/api/http-client';
import { storage } from '@/shared/utils/storage';

jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

const apiMock = new MockAdapter(apiClient);

const mockGetItem = storage.getItem as jest.Mock;

describe('apiFetch', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    registerAuthHooks(null);
    mockGetItem.mockResolvedValue(null);
  });

  it('should return the parsed JSON body on success', async () => {
    apiMock.onAny().reply(200, { id: 1 });

    const result = await apiFetch('/api/v1/boards/1/');

    expect(result).toEqual({ id: 1 });
  });

  it('should return undefined for a 204 response', async () => {
    apiMock.onAny().reply(204);

    const result = await apiFetch('/api/v1/boards/1/');

    expect(result).toBeUndefined();
  });

  it('should attach the Bearer token read from secure storage for an authenticated call', async () => {
    mockGetItem.mockResolvedValue('my-token');
    apiMock.onAny().reply(200, {});

    await apiFetch('/api/v1/boards/');

    expect(mockGetItem).toHaveBeenCalledWith('accessToken');
    expect(apiMock.history.get[0].url).toContain('/api/v1/boards/');
    expect(apiMock.history.get[0].headers?.Authorization).toBe('Bearer my-token');
  });

  it('should not attach an Authorization header for an unauthenticated call', async () => {
    mockGetItem.mockResolvedValue('my-token');
    apiMock.onAny().reply(200, {});

    await apiFetch('/api/v1/auth/token/', {
      method: 'POST',
      body: { email: 'a@b.com' },
      authenticated: false,
    });

    expect(apiMock.history.post[0].headers?.Authorization).toBeUndefined();
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it('should not attach an Authorization header when storage has no token', async () => {
    apiMock.onAny().reply(200, {});

    await apiFetch('/api/v1/boards/');

    expect(apiMock.history.get[0].headers?.Authorization).toBeUndefined();
  });

  it('should convert response body keys from snake_case to camelCase', async () => {
    apiMock.onAny().reply(200, { board_id: 1, assigned_to_id: null });

    const result = await apiFetch('/api/v1/tasks/1/');

    expect(result).toEqual({ boardId: 1, assignedToId: null });
  });

  it('should convert request body keys from camelCase to snake_case', async () => {
    apiMock.onAny().reply(201, {});

    await apiFetch('/api/v1/boards/', { method: 'POST', body: { firstName: 'Ada', boardId: 1 } });

    expect(apiMock.history.post[0].data).toBe(JSON.stringify({ first_name: 'Ada', board_id: 1 }));
  });

  it('should convert DRF field-error keys to camelCase in fieldErrors', async () => {
    apiMock.onAny().reply(400, { first_name: ['This field may not be blank.'] });

    await expect(apiFetch('/api/v1/boards/', { method: 'POST', body: {} })).rejects.toMatchObject({
      fieldErrors: { firstName: ['This field may not be blank.'] },
    });
  });

  it('should send a JSON content-type and stringified body for write requests', async () => {
    apiMock.onAny().reply(201, {});

    await apiFetch('/api/v1/boards/', { method: 'POST', body: { name: 'X' } });

    const request = apiMock.history.post[0];
    expect(request.headers?.['Content-Type']).toContain('application/json');
    expect(request.data).toBe(JSON.stringify({ name: 'X' }));
  });

  it('should throw an ApiError with the detail message when present', async () => {
    apiMock.onAny().reply(403, { detail: 'You do not have permission.' });

    await expect(apiFetch('/api/v1/boards/1/')).rejects.toThrow('You do not have permission.');
  });

  it('should throw an ApiError with the first field error and populate fieldErrors', async () => {
    apiMock.onAny().reply(400, { name: ['This field may not be blank.'] });

    await expect(apiFetch('/api/v1/boards/', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'This field may not be blank.',
      status: 400,
      fieldErrors: { name: ['This field may not be blank.'] },
    });
  });

  it('should fall back to a status-specific default message when the body has neither detail nor field errors', async () => {
    apiMock.onAny().reply(404, {});

    await expect(apiFetch('/api/v1/boards/999/')).rejects.toThrow(
      'No existe o no tenés acceso a este recurso.'
    );
  });

  it('should be an instance of ApiError carrying the status code', async () => {
    apiMock.onAny().reply(429, {});

    await expect(apiFetch('/api/v1/boards/')).rejects.toBeInstanceOf(ApiError);
  });

  // ── Four network failure families ───────────────────────────────────────

  it('should throw a ServerError for a 5xx response instead of parsing it as an ApiError', async () => {
    apiMock.onAny().reply(500, null);

    const promise = apiFetch('/api/v1/boards/');

    await expect(promise).rejects.toBeInstanceOf(ServerError);
    await expect(promise).rejects.toThrow('El servidor tuvo un problema. Intentá de nuevo en unos minutos.');
  });

  it('should throw a NetworkError when the request never reaches a server (offline, DNS, CORS)', async () => {
    apiMock.onAny().networkError();

    const promise = apiFetch('/api/v1/boards/');

    await expect(promise).rejects.toBeInstanceOf(NetworkError);
    await expect(promise).rejects.toThrow('No hay conexión con el servidor');
  });

  it('should throw a TimeoutError when the request is aborted', async () => {
    apiMock.onAny().timeout();

    const promise = apiFetch('/api/v1/boards/');

    await expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await expect(promise).rejects.toThrow('La solicitud tardó demasiado');
  });

  // ── 401 refresh-and-retry ────────────────────────────────────────────────
  //
  // In the real app, `refreshAccessToken` (wired from `useAuthSession`)
  // persists the new token to secure storage before resolving — that's what
  // makes the retried request pick it up, since the request interceptor
  // always reads storage fresh. These mocks reproduce that side effect by
  // updating what `storage.getItem` resolves to, the same way the real hook
  // would via `storage.setItem`.

  describe('on a 401 with a registered refresh hook', () => {
    it('should refresh the token and retry once, succeeding with the new token', async () => {
      mockGetItem.mockResolvedValue('old-token');
      const refreshAccessToken = jest.fn().mockImplementation(async () => {
        mockGetItem.mockResolvedValue('new-token');
        return 'new-token';
      });
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      apiMock
        .onAny()
        .replyOnce(401, { detail: 'Token expired.' })
        .onAny()
        .replyOnce(200, { id: 1 });

      const result = await apiFetch('/api/v1/boards/1/');

      expect(result).toEqual({ id: 1 });
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(apiMock.history.get).toHaveLength(2);
      expect(apiMock.history.get[1].headers?.Authorization).toBe('Bearer new-token');
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('should call onUnauthorized without retrying when the refresh itself fails', async () => {
      mockGetItem.mockResolvedValue('old-token');
      const refreshAccessToken = jest.fn().mockResolvedValue(null);
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      apiMock.onAny().reply(401, { detail: 'Token expired.' });

      await expect(apiFetch('/api/v1/boards/1/')).rejects.toThrow('Token expired.');

      expect(apiMock.history.get).toHaveLength(1);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should call onUnauthorized when the retried request is still 401', async () => {
      mockGetItem.mockResolvedValue('old-token');
      const refreshAccessToken = jest.fn().mockImplementation(async () => {
        mockGetItem.mockResolvedValue('new-token');
        return 'new-token';
      });
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      apiMock.onAny().reply(401, { detail: 'Token expired.' });

      await expect(apiFetch('/api/v1/boards/1/')).rejects.toThrow('Token expired.');

      expect(apiMock.history.get).toHaveLength(2);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should retry up to maxRefreshRetries times when repeated 401s keep coming back', async () => {
      mockGetItem.mockResolvedValue('token-1');
      const refreshAccessToken = jest
        .fn()
        .mockImplementationOnce(async () => {
          mockGetItem.mockResolvedValue('token-2');
          return 'token-2';
        })
        .mockImplementationOnce(async () => {
          mockGetItem.mockResolvedValue('token-3');
          return 'token-3';
        });
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized, maxRefreshRetries: 2 });

      apiMock
        .onAny()
        .replyOnce(401, { detail: 'Token expired.' })
        .onAny()
        .replyOnce(401, { detail: 'Token expired.' })
        .onAny()
        .replyOnce(200, { id: 1 });

      const result = await apiFetch('/api/v1/boards/1/');

      expect(result).toEqual({ id: 1 });
      expect(refreshAccessToken).toHaveBeenCalledTimes(2);
      expect(apiMock.history.get).toHaveLength(3);
      expect(apiMock.history.get[2].headers?.Authorization).toBe('Bearer token-3');
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('should give up and call onUnauthorized after exhausting maxRefreshRetries', async () => {
      mockGetItem.mockResolvedValue('old-token');
      const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized, maxRefreshRetries: 2 });

      apiMock.onAny().reply(401, { detail: 'Token expired.' });

      await expect(apiFetch('/api/v1/boards/1/')).rejects.toThrow('Token expired.');

      expect(refreshAccessToken).toHaveBeenCalledTimes(2);
      expect(apiMock.history.get).toHaveLength(3);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should not attempt a refresh for an unauthenticated request', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      apiMock.onAny().reply(401, { detail: 'Invalid credentials.' });

      await expect(
        apiFetch('/api/v1/auth/token/', { method: 'POST', body: {}, authenticated: false })
      ).rejects.toThrow('Invalid credentials.');

      expect(refreshAccessToken).not.toHaveBeenCalled();
      expect(onUnauthorized).not.toHaveBeenCalled();
      expect(apiMock.history.post).toHaveLength(1);
    });
  });

  it('should not crash on a 401 when no auth hooks are registered', async () => {
    apiMock.onAny().reply(401, { detail: 'Token expired.' });

    await expect(apiFetch('/api/v1/boards/1/')).rejects.toThrow('Token expired.');
    expect(apiMock.history.get).toHaveLength(1);
  });
});
