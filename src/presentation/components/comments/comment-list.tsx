import { Paragraph, Spinner, YStack } from 'tamagui';

import { Comment } from '@/domain/models/comment';
import { CommentItem } from '@/presentation/components/comments/comment-item';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  comments: Comment[];
  currentUserId: number | null;
  isOwner: boolean;
  editingId: number | null;
  editContent: string;
  onEditContentChange: (value: string) => void;
  isSavingEdit: boolean;
  editError: string | null;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  deletingId: number | null;
  onDelete: (id: number) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
};

export function CommentList({
  comments,
  currentUserId,
  isOwner,
  editingId,
  editContent,
  onEditContentChange,
  isSavingEdit,
  editError,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  deletingId,
  onDelete,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  if (comments.length === 0) {
    return (
      <Paragraph color="$muted" fontSize={14}>
        No hay comentarios todavía
      </Paragraph>
    );
  }

  return (
    <YStack gap="$2">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canManage={isOwner || comment.user_id === currentUserId}
          isEditing={editingId === comment.id}
          editContent={editContent}
          onEditContentChange={onEditContentChange}
          isSaving={isSavingEdit}
          editError={editError}
          onStartEdit={() => onStartEdit(comment)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          isDeleting={deletingId === comment.id}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
      {hasMore ? (
        isLoadingMore ? (
          <Spinner marginTop="$2" />
        ) : (
          <AppButton label="Cargar más" variant="outlined" marginTop="$2" onPress={onLoadMore} />
        )
      ) : null}
    </YStack>
  );
}
