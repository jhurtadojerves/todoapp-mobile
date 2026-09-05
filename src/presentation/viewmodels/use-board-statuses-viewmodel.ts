import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_COLOR = '#64748b';

export function useBoardStatusesViewModel(boardId: number) {
  const { token } = useAuth();
  const [statuses, setStatuses] = useState<BoardStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadStatuses = useCallback(() => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    return dependencies.getStatusesUseCase
      .execute(token, boardId)
      .then((payload) => {
        setStatuses(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los estados.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, boardId]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const createStatus = async (): Promise<void> => {
    setCreateError(null);

    if (!newName.trim()) {
      setCreateError('El nombre es obligatorio');
      throw new Error('El nombre es obligatorio');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsCreating(true);
    try {
      const input: BoardStatusInput = {
        name: newName.trim(),
        order: statuses.length,
        color: DEFAULT_COLOR,
      };
      await dependencies.createStatusUseCase.execute(token, boardId, input);
      setNewName('');
      await loadStatuses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el estado.';
      setCreateError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (status: BoardStatus) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditError(null);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingId === null) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError('El nombre es obligatorio');
      throw new Error('El nombre es obligatorio');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    const target = statuses.find((status) => status.id === editingId);
    setIsSavingEdit(true);
    try {
      const input: BoardStatusInput = {
        name: editName.trim(),
        order: target?.order ?? 0,
        color: target?.color ?? DEFAULT_COLOR,
      };
      await dependencies.updateStatusUseCase.execute(token, boardId, editingId, input);
      cancelEdit();
      await loadStatuses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el estado.';
      setEditError(message);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteStatus = async (id: number): Promise<void> => {
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setDeletingId(id);
    setDeleteError(null);
    try {
      await dependencies.deleteStatusUseCase.execute(token, boardId, id);
      await loadStatuses();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el estado.';
      setDeleteError(message);
      throw err;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    statuses,
    isLoading,
    error,
    newName,
    setNewName,
    isCreating,
    createError,
    createStatus,
    editingId,
    editName,
    setEditName,
    startEdit,
    cancelEdit,
    isSavingEdit,
    editError,
    saveEdit,
    deletingId,
    deleteError,
    deleteStatus,
  };
}
