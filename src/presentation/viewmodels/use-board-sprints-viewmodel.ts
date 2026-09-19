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
  const { isAuthenticated } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  const loadPage = useCallback(
    (pageNumber: number, append: boolean) => {
      if (!isAuthenticated) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      return dependencies.getSprintsUseCase
        .execute(boardId, pageNumber)
        .then((result) => {
          setSprints((prev) => (append ? [...prev, ...result.results] : result.results));
          setHasMore(Boolean(result.next));
          setPage(pageNumber);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los sprints.');
        })
        .finally(() => {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        });
    },
    [isAuthenticated, boardId]
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadPage(page + 1, true);
    }
  }, [hasMore, isLoadingMore, loadPage, page]);

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

    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    setIsCreating(true);
    try {
      const input: SprintInput = {
        name: newName.trim(),
        startDate: normalizeDate(newStartDate),
        endDate: normalizeDate(newEndDate),
      };
      await dependencies.createSprintUseCase.execute(boardId, input);
      setNewName('');
      setNewStartDate('');
      setNewEndDate('');
      await loadPage(1, false);
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
    setEditStartDate(sprint.startDate ?? '');
    setEditEndDate(sprint.endDate ?? '');
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

    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    setIsSavingEdit(true);
    try {
      const input: SprintInput = {
        name: editName.trim(),
        startDate: normalizeDate(editStartDate),
        endDate: normalizeDate(editEndDate),
      };
      await dependencies.updateSprintUseCase.execute(boardId, editingId, input);
      cancelEdit();
      await loadPage(1, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el sprint.';
      setEditError(message);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteSprint = async (id: number): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    setDeletingId(id);
    setDeleteError(null);
    try {
      await dependencies.deleteSprintUseCase.execute(boardId, id);
      await loadPage(1, false);
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
    isLoadingMore,
    hasMore,
    loadMore,
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
    reload: () => loadPage(1, false),
  };
}
