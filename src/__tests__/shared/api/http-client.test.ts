import { apiFetch, ApiError, registerAuthHooks } from '@/shared/api/http-client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerAuthHooks(null);
  });

  it('should return the parsed JSON body on success', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, { id: 1 }));

    const result = await apiFetch('/api/v1/boards/1/');

    expect(result).toEqual({ id: 1 });
  });

  it('should return undefined for a 204 response', async () => {
    mockFetch.mockResolvedValue(mockResponse(204, null));

    const result = await apiFetch('/api/v1/boards/1/');

    expect(result).toBeUndefined();
  });

  it('should attach the Bearer token when provided', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, {}));

    await apiFetch('/api/v1/boards/', { token: 'my-token' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/boards/'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      })
    );
  });

  it('should not attach an Authorization header when no token is given', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, {}));

    await apiFetch('/api/v1/auth/token/', { method: 'POST', body: { email: 'a@b.com' } });

    const [, requestInit] = mockFetch.mock.calls[0];
    expect(requestInit.headers).not.toHaveProperty('Authorization');
  });

  it('should send a JSON content-type and stringified body for write requests', async () => {
    mockFetch.mockResolvedValue(mockResponse(201, {}));

    await apiFetch('/api/v1/boards/', { method: 'POST', body: { name: 'X' } });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: 'X' }),
      })
    );
  });

  it('should throw an ApiError with the detail message when present', async () => {
    mockFetch.mockResolvedValue(mockResponse(403, { detail: 'You do not have permission.' }));

    await expect(apiFetch('/api/v1/boards/1/', { token: 't' })).rejects.toThrow(
      'You do not have permission.'
    );
  });

  it('should throw an ApiError with the first field error and populate fieldErrors', async () => {
    mockFetch.mockResolvedValue(mockResponse(400, { name: ['This field may not be blank.'] }));

    await expect(apiFetch('/api/v1/boards/', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'This field may not be blank.',
      status: 400,
      fieldErrors: { name: ['This field may not be blank.'] },
    });
  });

  it('should fall back to a status-specific default message when the body has neither detail nor field errors', async () => {
    mockFetch.mockResolvedValue(mockResponse(404, {}));

    await expect(apiFetch('/api/v1/boards/999/', { token: 't' })).rejects.toThrow(
      'No existe o no tenés acceso a este recurso.'
    );
  });

  it('should fall back to a generic message when the response body cannot be parsed', async () => {
    mockFetch.mockResolvedValue(mockResponse(500, null));

    await expect(apiFetch('/api/v1/boards/', { token: 't' })).rejects.toThrow(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });

  it('should be an instance of ApiError carrying the status code', async () => {
    mockFetch.mockResolvedValue(mockResponse(429, {}));

    await expect(apiFetch('/api/v1/boards/', { token: 't' })).rejects.toBeInstanceOf(ApiError);
  });

  // ── 401 refresh-and-retry ────────────────────────────────────────────────

  describe('on a 401 with a registered refresh hook', () => {
    it('should refresh the token and retry once, succeeding with the new token', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      mockFetch
        .mockResolvedValueOnce(mockResponse(401, { detail: 'Token expired.' }))
        .mockResolvedValueOnce(mockResponse(200, { id: 1 }));

      const result = await apiFetch('/api/v1/boards/1/', { token: 'old-token' });

      expect(result).toEqual({ id: 1 });
      expect(refreshAccessToken).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe('Bearer new-token');
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('should call onUnauthorized without retrying when the refresh itself fails', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue(null);
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      mockFetch.mockResolvedValueOnce(mockResponse(401, { detail: 'Token expired.' }));

      await expect(apiFetch('/api/v1/boards/1/', { token: 'old-token' })).rejects.toThrow(
        'Token expired.'
      );

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should call onUnauthorized when the retried request is still 401', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      mockFetch.mockResolvedValue(mockResponse(401, { detail: 'Token expired.' }));

      await expect(apiFetch('/api/v1/boards/1/', { token: 'old-token' })).rejects.toThrow(
        'Token expired.'
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });

    it('should not attempt a refresh for an unauthenticated request', async () => {
      const refreshAccessToken = jest.fn().mockResolvedValue('new-token');
      const onUnauthorized = jest.fn();
      registerAuthHooks({ refreshAccessToken, onUnauthorized });

      mockFetch.mockResolvedValue(mockResponse(401, { detail: 'Invalid credentials.' }));

      await expect(apiFetch('/api/v1/auth/token/', { method: 'POST', body: {} })).rejects.toThrow(
        'Invalid credentials.'
      );

      expect(refreshAccessToken).not.toHaveBeenCalled();
      expect(onUnauthorized).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should not crash on a 401 when no auth hooks are registered', async () => {
    mockFetch.mockResolvedValue(mockResponse(401, { detail: 'Token expired.' }));

    await expect(apiFetch('/api/v1/boards/1/', { token: 'old-token' })).rejects.toThrow(
      'Token expired.'
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
