import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UserCredentials } from '@/domain/models/token';
import { RegisterCredentials } from '@/domain/models/register';
import { dependencies } from '@/shared/di/dependencies';
import { storage } from '@/shared/utils/storage';
import { decodeJwtPayload } from '@/shared/utils/jwt';
import { registerAuthHooks } from '@/shared/api/http-client';

export function useAuthSession() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  const userId = useMemo(() => {
    if (!token) return null;
    return decodeJwtPayload(token)?.user_id ?? null;
  }, [token]);

  const persistTokens = useCallback(async (access: string, refresh: string) => {
    setToken(access);
    setRefreshToken(refresh);
    await storage.setItem('accessToken', access);
    await storage.setItem('refreshToken', refresh);
  }, []);

  const clearTokens = useCallback(async () => {
    setToken(null);
    setRefreshToken(null);
    await storage.deleteItem('accessToken');
    await storage.deleteItem('refreshToken');
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedAccess = await storage.getItem('accessToken');
      const storedRefresh = await storage.getItem('refreshToken');

      if (storedAccess && storedRefresh) {
        setToken(storedAccess);
        setRefreshToken(storedRefresh);
      }
    };

    restoreSession();
  }, []);

  // De-duplicated: if a refresh is already in flight (e.g. two API calls hit
  // an expired access token around the same time), concurrent callers await
  // the same promise instead of racing separate refresh requests — the
  // backend rotates refresh tokens on use, so a second concurrent refresh
  // call fails outright and would otherwise look like a real session expiry.
  const refreshAccessToken = useCallback((): Promise<string | null> => {
    if (!refreshToken) return Promise.resolve(null);

    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const promise = (async () => {
      try {
        const tokens = await dependencies.refreshTokenUseCase.execute(refreshToken);
        await persistTokens(tokens.access, tokens.refresh);
        return tokens.access;
      } catch {
        await clearTokens();
        return null;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = promise;
    return promise;
  }, [refreshToken, persistTokens, clearTokens]);

  const login = useCallback(
    async (credentials: UserCredentials) => {
      setIsAuthenticating(true);
      try {
        const tokens = await dependencies.loginUseCase.execute(credentials);
        await persistTokens(tokens.access, tokens.refresh);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [persistTokens]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      setIsAuthenticating(true);
      try {
        await dependencies.registerUseCase.execute(credentials);
        // El registro no devuelve tokens, así que iniciamos sesión con las mismas credenciales.
        const tokens = await dependencies.loginUseCase.execute({
          email: credentials.email,
          password: credentials.password,
        });
        await persistTokens(tokens.access, tokens.refresh);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [persistTokens]
  );

  const refreshSession = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await refreshAccessToken();
    } finally {
      setIsAuthenticating(false);
    }
  }, [refreshAccessToken]);

  const logout = useCallback(() => {
    void clearTokens();
  }, [clearTokens]);

  const onUnauthorized = useCallback(() => {
    void clearTokens();
    router.replace('/boards');
  }, [clearTokens]);

  useEffect(() => {
    registerAuthHooks({ refreshAccessToken, onUnauthorized });
    return () => registerAuthHooks(null);
  }, [refreshAccessToken, onUnauthorized]);

  return useMemo(
    () => ({
      token,
      refreshToken,
      userId,
      isAuthenticated: Boolean(token),
      isAuthenticating,
      login,
      register,
      logout,
      refreshSession,
    }),
    [token, refreshToken, userId, isAuthenticating, login, register, logout, refreshSession]
  );
}
