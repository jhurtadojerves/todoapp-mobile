import { UserCredentials } from '@/domain/models/token';
import { useAuth } from '@/presentation/contexts/auth-context';
import { useState } from 'react';

export function useLoginViewModel() {
  const { login, isAuthenticating } = useAuth();
  const [credentials, setCredentials] = useState<UserCredentials>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof UserCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setError(null);

    try {
      await login(credentials);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión. Revisa tus credenciales.';
      setError(message);
      throw err;
    }
  };

  return {
    credentials,
    setField,
    submit,
    error,
    isAuthenticating,
  };
}
