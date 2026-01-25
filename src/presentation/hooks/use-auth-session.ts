import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { UserCredentials } from '@/domain/models/token';
import { dependencies } from '@/shared/di/dependencies';

export function useAuthSession() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const persistTokens = useCallback(async (access: string, refresh: string) => {
    setToken(access);
    setRefreshToken(refresh);
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
  }, []);

  const clearTokens = useCallback(async () => {
    setToken(null);
    setRefreshToken(null);
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedAccess = await SecureStore.getItemAsync('accessToken');
      const storedRefresh = await SecureStore.getItemAsync('refreshToken');

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
      isAuthenticated: Boolean(token),
      isAuthenticating,
      login,
      logout,
      refreshSession,
    }),
    [token, refreshToken, isAuthenticating, login, logout, refreshSession]
  );
}
