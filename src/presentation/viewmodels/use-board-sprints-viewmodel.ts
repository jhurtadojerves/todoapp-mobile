import { Sprint, SprintInput } from '@/domain/models/sprint';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

function isValidDate(value: string): boolean {
  return !value.trim() || DATE_PATTERN.test(value.trim());
}

export function useBoardSprintsViewModel(boardId: number) {
  const { token } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadSprints = useCallback(() => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    return dependencies.getSprintsUseCase
      .execute(token, boardId)
      .then((payload) => {
        setSprints(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los sprints.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, boardId]);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const createSprint = async (): Promise<void> => {
    setCreateError(null);

    if (!newName.trim()) {
      setCreateError('El nombre es obligatorio');
      throw new Error('El nombre es obligatorio');
    }

    if (!isValidDate(newStartDate) || !isValidDate(newEndDate)) {
      setCreateError('Las fechas deben tener el formato AAAA-MM-DD');
      throw new Error('Las fechas deben tener el formato AAAA-MM-DD');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsCreating(true);
    try {
      const input: SprintInput = {
        name: newName.trim(),
        start_date: normalizeDate(newStartDate),
        end_date: normalizeDate(newEndDate),
      };
      await dependencies.createSprintUseCase.execute(token, boardId, input);
      setNewName('');
      setNewStartDate('');
      setNewEndDate('');
      await loadSprints();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el sprint.';
      setCreateError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (sprint: Sprint) => {
    setEditingId(sprint.id);
    setEditName(sprint.name);
    setEditStartDate(sprint.start_date ?? '');
    setEditEndDate(sprint.end_date ?? '');
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditStartDate('');
    setEditEndDate('');
    setEditError(null);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingId === null) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError('El nombre es obligatorio');
      throw new Error('El nombre es obligatorio');
    }

    if (!isValidDate(editStartDate) || !isValidDate(editEndDate)) {
      setEditError('Las fechas deben tener el formato AAAA-MM-DD');
      throw new Error('Las fechas deben tener el formato AAAA-MM-DD');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsSavingEdit(true);
    try {
      const input: SprintInput = {
        name: editName.trim(),
        start_date: normalizeDate(editStartDate),
        end_date: normalizeDate(editEndDate),
      };
      await dependencies.updateSprintUseCase.execute(token, boardId, editingId, input);
      cancelEdit();
      await loadSprints();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el sprint.';
      setEditError(message);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteSprint = async (id: number): Promise<void> => {
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setDeletingId(id);
    setDeleteError(null);
    try {
      await dependencies.deleteSprintUseCase.execute(token, boardId, id);
      await loadSprints();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el sprint.';
      setDeleteError(message);
      throw err;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    sprints,
    isLoading,
    error,
    newName,
    setNewName,
    newStartDate,
    setNewStartDate,
    newEndDate,
    setNewEndDate,
    isCreating,
    createError,
    createSprint,
    editingId,
    editName,
    setEditName,
    editStartDate,
    setEditStartDate,
    editEndDate,
    setEditEndDate,
    startEdit,
    cancelEdit,
    isSavingEdit,
    editError,
    saveEdit,
    deletingId,
    deleteError,
    deleteSprint,
  };
}
