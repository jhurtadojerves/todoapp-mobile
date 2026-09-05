import { Comment } from '@/domain/models/comment';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useState } from 'react';

export function useTaskCommentsViewModel(taskId: number) {
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadPage = useCallback(
    (pageNumber: number, append: boolean) => {
      if (!token) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      return dependencies.getCommentsUseCase
        .execute(token, taskId, pageNumber)
        .then((result) => {
          setComments((prev) => (append ? [...prev, ...result.results] : result.results));
          setHasMore(Boolean(result.next));
          setPage(pageNumber);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los comentarios.');
        })
        .finally(() => {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        });
    },
    [token, taskId]
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadPage(page + 1, true);
    }
  }, [hasMore, isLoadingMore, loadPage, page]);

  const createComment = async (): Promise<void> => {
    setCreateError(null);

    if (!newContent.trim()) {
      setCreateError('El comentario no puede estar vacío');
      throw new Error('El comentario no puede estar vacío');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsCreating(true);
    try {
      await dependencies.createCommentUseCase.execute(token, taskId, { content: newContent.trim() });
      setNewContent('');
      await loadPage(1, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo agregar el comentario.';
      setCreateError(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditError(null);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingId === null) return;
    setEditError(null);

    if (!editContent.trim()) {
      setEditError('El comentario no puede estar vacío');
      throw new Error('El comentario no puede estar vacío');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsSavingEdit(true);
    try {
      await dependencies.updateCommentUseCase.execute(token, taskId, editingId, {
        content: editContent.trim(),
      });
      cancelEdit();
      await loadPage(1, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el comentario.';
      setEditError(message);
      throw err;
    } finally {
      setIsSavingEdit(false);
    }
  };

  const deleteComment = async (id: number): Promise<void> => {
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setDeletingId(id);
    setDeleteError(null);
    try {
      await dependencies.deleteCommentUseCase.execute(token, taskId, id);
      await loadPage(1, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el comentario.';
      setDeleteError(message);
      throw err;
    } finally {
      setDeletingId(null);
    }
  };

  return {
    comments,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    newContent,
    setNewContent,
    isCreating,
    createError,
    createComment,
    editingId,
    editContent,
    setEditContent,
    startEdit,
    cancelEdit,
    isSavingEdit,
    editError,
    saveEdit,
    deletingId,
    deleteError,
    deleteComment,
    reload: () => loadPage(1, false),
  };
}
