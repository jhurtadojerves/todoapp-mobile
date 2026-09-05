import { UserCredentials } from '@/domain/models/token';
import { RegisterCredentials } from '@/domain/models/register';
import { useAuthSession } from '@/presentation/hooks/use-auth-session';
import { createContext, useContext, type ReactNode } from 'react';

interface AuthContextValue {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login(credentials: UserCredentials): Promise<void>;
  register(credentials: RegisterCredentials): Promise<void>;
  logout(): void;
  refreshSession(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthSession();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
