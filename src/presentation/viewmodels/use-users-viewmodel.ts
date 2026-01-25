import { User } from '@/domain/models/user';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useEffect, useState } from 'react';

export function useUsersViewModel() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    dependencies
      .getUsersUseCase.execute(token)
      .then((payload) => {
        if (isMounted) {
          setUsers(payload);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return { users, isLoading, error, logout };
}
