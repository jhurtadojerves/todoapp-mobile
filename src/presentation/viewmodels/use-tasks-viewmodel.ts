import { Task } from '@/domain/models/task';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useTasksViewModel(boardId: number) {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);

  const loadPage = useCallback(
    (pageNumber: number, append: boolean) => {
      if (!token) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      return dependencies.getTasksUseCase
        .execute(token, boardId, pageNumber, statusFilter !== undefined ? { status: statusFilter } : undefined)
        .then((result) => {
          setTasks((prev) => (append ? [...prev, ...result.results] : result.results));
          setHasMore(Boolean(result.next));
          setPage(pageNumber);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar las tareas.');
        })
        .finally(() => {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        });
    },
    [token, boardId, statusFilter]
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadPage(page + 1, true);
    }
  }, [hasMore, isLoadingMore, loadPage, page]);

  const reload = useCallback(() => loadPage(1, false), [loadPage]);

  return {
    tasks,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reload,
    statusFilter,
    setStatusFilter,
  };
}
