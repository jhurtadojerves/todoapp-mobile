import { BoardInput } from '@/domain/models/board';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useEffect, useState } from 'react';

export function useBoardFormViewModel(boardId?: number) {
  const { isAuthenticated } = useAuth();
  const isEditing = boardId !== undefined;
  const [fields, setFields] = useState<BoardInput>({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || boardId === undefined) {
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    dependencies.getBoardUseCase
      .execute(boardId)
      .then((board) => {
        if (isMounted) {
          setFields({ name: board.name, description: board.description });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el tablero.');
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
  }, [isAuthenticated, boardId]);

  const setField = (field: keyof BoardInput, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' && value.trim()) {
      setNameError(null);
    }
  };

  const submit = async (): Promise<void> => {
    setError(null);

    if (!fields.name.trim()) {
      setNameError('El nombre es obligatorio');
      throw new Error('El nombre es obligatorio');
    }

    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dependencies.updateBoardUseCase.execute(boardId, fields);
      } else {
        await dependencies.createBoardUseCase.execute(fields);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el tablero.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(fields.name.trim()) && !isSubmitting && !isLoading;

  return {
    fields,
    setField,
    submit,
    isEditing,
    isLoading,
    isSubmitting,
    error,
    nameError,
    canSubmit,
  };
}
