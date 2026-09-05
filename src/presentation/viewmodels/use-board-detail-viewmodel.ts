import { Board } from '@/domain/models/board';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useBoardDetailViewModel(boardId: number) {
  const { token } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadBoard = useCallback(() => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    return dependencies.getBoardUseCase
      .execute(token, boardId)
      .then((payload) => {
        setBoard(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el tablero.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const deleteBoard = async (): Promise<void> => {
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await dependencies.deleteBoardUseCase.execute(token, boardId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el tablero.';
      setDeleteError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { board, isLoading, error, isDeleting, deleteError, deleteBoard, reload: loadBoard };
}
