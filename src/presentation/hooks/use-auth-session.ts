import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserCredentials } from '@/domain/models/token';
import { RegisterCredentials } from '@/domain/models/register';
import { dependencies } from '@/shared/di/dependencies';
import { storage } from '@/shared/utils/storage';
import { decodeJwtPayload } from '@/shared/utils/jwt';

export function useAuthSession() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

      if (!storedRefresh) {
        return;
      }

      try {
        const tokens = await dependencies.refreshTokenUseCase.execute(storedRefresh);
        await persistTokens(tokens.access, tokens.refresh);
      } catch {
        await clearTokens();
      }
    };

    restoreSession();
  }, [clearTokens, persistTokens]);

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
    if (!refreshToken) return;
    setIsAuthenticating(true);
    try {
      const tokens = await dependencies.refreshTokenUseCase.execute(refreshToken);
      await persistTokens(tokens.access, tokens.refresh);
    } finally {
      setIsAuthenticating(false);
    }
  }, [refreshToken, persistTokens]);

  const logout = useCallback(() => {
    void clearTokens();
  }, [clearTokens]);

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
