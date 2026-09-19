import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';

import { CommentList } from '@/presentation/components/comments/comment-list';
import { TaskAttachmentList } from '@/presentation/components/tasks/task-attachment-list';
import { AppButton, AppInput } from '@/presentation/components/ui';
import { useAuth } from '@/presentation/contexts/auth-context';
import { useBoardMembersViewModel } from '@/presentation/viewmodels/use-board-members-viewmodel';
import { useTaskAttachmentsViewModel } from '@/presentation/viewmodels/use-task-attachments-viewmodel';
import { useTaskCommentsViewModel } from '@/presentation/viewmodels/use-task-comments-viewmodel';
import { useTaskDetailViewModel } from '@/presentation/viewmodels/use-task-detail-viewmodel';
import { confirmAction } from '@/shared/utils/confirm';

type Props = {
  boardId: number;
  taskId: number;
};

export function TaskDetailScreen({ boardId, taskId }: Props) {
  const router = useRouter();
  const { userId } = useAuth();
  const { task, isLoading, error, isDeleting, deleteError, deleteTask } =
    useTaskDetailViewModel(taskId);
  const { isOwner } = useBoardMembersViewModel(boardId);
  const {
    comments,
    isLoading: isLoadingComments,
    isLoadingMore: isLoadingMoreComments,
    hasMore: hasMoreComments,
    error: commentsError,
    loadMore: loadMoreComments,
    newContent,
    setNewContent,
    isCreating: isCreatingComment,
    createError: createCommentError,
    createComment,
    editingId: editingCommentId,
    editContent,
    setEditContent,
    startEdit: startEditComment,
    cancelEdit: cancelEditComment,
    isSavingEdit: isSavingCommentEdit,
    editError: editCommentError,
    saveEdit: saveCommentEdit,
    deletingId: deletingCommentId,
    deleteError: deleteCommentError,
    deleteComment,
    reload: reloadComments,
  } = useTaskCommentsViewModel(taskId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const {
    attachments,
    isLoading: isLoadingAttachments,
    error: attachmentsError,
    isCapturing,
    captureError,
    deletingId: deletingAttachmentId,
    deleteError: deleteAttachmentError,
    captureAttachment,
    deleteAttachment,
  } = useTaskAttachmentsViewModel(taskId);

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: 'Eliminar tarea',
      message: '¿Seguro que querés eliminar esta tarea? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });
    if (!confirmed) return;

    setConfirmingDelete(true);
    try {
      await deleteTask();
      router.replace(`/board/${boardId}/tasks` as any);
    } catch {
      setConfirmingDelete(false);
    }
  };

  const handleCreateComment = async () => {
    try {
      await createComment();
    } catch {
    }
  };

  const handleSaveCommentEdit = async () => {
    try {
      await saveCommentEdit();
    } catch {
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    const confirmed = await confirmAction({
      title: 'Borrar foto',
      message: '¿Seguro que querés borrar esta foto adjunta?',
      confirmLabel: 'Borrar',
    });
    if (!confirmed) return;

    deleteAttachment(id).catch(() => {});
  };

  const handleDeleteComment = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Borrar comentario',
      message: '¿Seguro que querés borrar este comentario?',
      confirmLabel: 'Borrar',
    });
    if (!confirmed) return;

    deleteComment(id).catch(() => {});
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner />
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$4" gap="$4">
          {error ? (
            <Paragraph color="$danger">{error}</Paragraph>
          ) : task ? (
            <>
              <YStack gap="$2">
                <Paragraph fontSize={22} fontWeight="700" color="$text">
                  {task.title}
                </Paragraph>
                <Paragraph color="$muted" fontSize={16}>
                  {task.description || 'Sin descripción'}
                </Paragraph>
              </YStack>

              <XStack gap="$2" flexWrap="wrap">
                {task.status ? (
                  <XStack alignItems="center" gap="$1">
                    <YStack width={10} height={10} borderRadius={5} backgroundColor={task.status.color || '$muted'} />
                    <Paragraph color="$muted" fontSize={13}>
                      {task.status.name}
                    </Paragraph>
                  </XStack>
                ) : null}
                {task.sprint ? (
                  <Paragraph color="$muted" fontSize={13}>
                    {task.status ? '· ' : ''}
                    {task.sprint.name}
                  </Paragraph>
                ) : null}
              </XStack>

              {deleteError ? <Paragraph color="$danger">{deleteError}</Paragraph> : null}

              <YStack gap="$3">
                <AppButton
                  label="Editar"
                  variant="outlined"
                  onPress={() => router.push(`/board/${boardId}/tasks/${task.id}/edit` as any)}
                />
                <AppButton
                  label="Eliminar tarea"
                  loading={isDeleting || confirmingDelete}
                  onPress={handleDelete}
                  backgroundColor="$danger"
                />
              </YStack>

              <YStack gap="$3" borderTopWidth={1} borderColor="$border" paddingTop="$4">
                <Paragraph fontSize={18} fontWeight="700" color="$text">
                  Fotos y ubicación
                </Paragraph>

                <AppButton
                  label="Tomar foto"
                  variant="outlined"
                  loading={isCapturing}
                  onPress={captureAttachment}
                />

                {captureError ? (
                  <Paragraph color="$danger" fontSize={13}>
                    {captureError}
                  </Paragraph>
                ) : null}

                {deleteAttachmentError ? (
                  <Paragraph color="$danger" fontSize={13}>
                    {deleteAttachmentError}
                  </Paragraph>
                ) : null}

                {isLoadingAttachments ? (
                  <Spinner />
                ) : attachmentsError ? (
                  <Paragraph color="$danger">{attachmentsError}</Paragraph>
                ) : (
                  <TaskAttachmentList
                    attachments={attachments}
                    deletingId={deletingAttachmentId}
                    onDelete={handleDeleteAttachment}
                  />
                )}
              </YStack>

              <YStack gap="$3" borderTopWidth={1} borderColor="$border" paddingTop="$4">
                <Paragraph fontSize={18} fontWeight="700" color="$text">
                  Comentarios
                </Paragraph>

                <YStack gap="$2">
                  <AppInput
                    placeholder="Escribí un comentario..."
                    value={newContent}
                    onChangeText={setNewContent}
                    multiline
                    numberOfLines={3}
                    height={80}
                    textAlignVertical="top"
                    paddingTop="$3"
                  />
                  {createCommentError ? (
                    <Paragraph color="$danger" fontSize={13}>
                      {createCommentError}
                    </Paragraph>
                  ) : null}
                  <AppButton
                    label="Comentar"
                    loading={isCreatingComment}
                    disabled={!newContent.trim() || isCreatingComment}
                    onPress={handleCreateComment}
                  />
                </YStack>

                {deleteCommentError ? <Paragraph color="$danger">{deleteCommentError}</Paragraph> : null}

                {isLoadingComments ? (
                  <Spinner />
                ) : commentsError ? (
                  <YStack gap="$3" alignItems="flex-start">
                    <Paragraph color="$danger">{commentsError}</Paragraph>
                    <AppButton label="Reintentar" variant="outlined" width={160} onPress={reloadComments} />
                  </YStack>
                ) : (
                  <CommentList
                    comments={comments}
                    currentUserId={userId}
                    isOwner={isOwner}
                    editingId={editingCommentId}
                    editContent={editContent}
                    onEditContentChange={setEditContent}
                    isSavingEdit={isSavingCommentEdit}
                    editError={editCommentError}
                    onStartEdit={startEditComment}
                    onCancelEdit={cancelEditComment}
                    onSaveEdit={handleSaveCommentEdit}
                    deletingId={deletingCommentId}
                    onDelete={handleDeleteComment}
                    hasMore={hasMoreComments}
                    isLoadingMore={isLoadingMoreComments}
                    onLoadMore={loadMoreComments}
                  />
                )}
              </YStack>
            </>
          ) : null}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
