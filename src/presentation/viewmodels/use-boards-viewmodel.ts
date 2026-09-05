import { Board } from '@/domain/models/board';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useBoardsViewModel() {
  const { token } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(() => {
    if (!token) {
      setBoards([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    return dependencies.getBoardsUseCase
      .execute(token)
      .then((payload) => {
        setBoards(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los tableros.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  return { boards, isLoading, error, reload: loadBoards };
}
