import { Task } from '@/domain/models/task';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useTaskDetailViewModel(taskId: number) {
  const { isAuthenticated } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadTask = useCallback(() => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    return dependencies.getTaskUseCase
      .execute(taskId)
      .then((payload) => {
        setTask(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la tarea.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const deleteTask = async (): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await dependencies.deleteTaskUseCase.execute(taskId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la tarea.';
      setDeleteError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { task, isLoading, error, isDeleting, deleteError, deleteTask, reload: loadTask };
}
