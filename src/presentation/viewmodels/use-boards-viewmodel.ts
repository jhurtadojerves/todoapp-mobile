import { Board } from '@/domain/models/board';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useBoardsViewModel() {
  const { token } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    (pageNumber: number, append: boolean) => {
      if (!token) {
        setBoards([]);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      return dependencies.getBoardsUseCase
        .execute(token, pageNumber)
        .then((result) => {
          setBoards((prev) => (append ? [...prev, ...result.results] : result.results));
          setHasMore(Boolean(result.next));
          setPage(pageNumber);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los tableros.');
        })
        .finally(() => {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        });
    },
    [token]
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

  return { boards, isLoading, isLoadingMore, hasMore, error, loadMore, reload };
}
