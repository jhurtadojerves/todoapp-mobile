import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { Comment } from '@/domain/models/comment';
import { AppButton, AppInput } from '@/presentation/components/ui';

type Props = {
  comment: Comment;
  canManage: boolean;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (value: string) => void;
  isSaving: boolean;
  editError: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  isDeleting: boolean;
  onDelete: () => void;
};

export function CommentItem({
  comment,
  canManage,
  isEditing,
  editContent,
  onEditContentChange,
  isSaving,
  editError,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isDeleting,
  onDelete,
}: Props) {
  if (isEditing) {
    return (
      <YStack
        backgroundColor="$backgroundSoft"
        borderRadius="$3"
        borderWidth={1}
        borderColor="$border"
        padding="$3"
        gap="$2"
      >
        <AppInput
          value={editContent}
          onChangeText={onEditContentChange}
          multiline
          numberOfLines={3}
          height={80}
          textAlignVertical="top"
          paddingTop="$3"
        />
        {editError ? (
          <Paragraph color="$danger" fontSize={13}>
            {editError}
          </Paragraph>
        ) : null}
        <XStack gap="$2">
          <AppButton
            label="Guardar"
            flex={1}
            height={40}
            loading={isSaving}
            disabled={!editContent.trim() || isSaving}
            onPress={onSaveEdit}
          />
          <AppButton
            label="Cancelar"
            flex={1}
            height={40}
            variant="outlined"
            disabled={isSaving}
            onPress={onCancelEdit}
          />
        </XStack>
      </YStack>
    );
  }

  return (
    <YStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      gap="$2"
    >
      <Paragraph color="$text" fontSize={14}>
        {comment.content}
      </Paragraph>

      {canManage ? (
        isDeleting ? (
          <Spinner size="small" />
        ) : (
          <XStack gap="$2">
            <AppButton label="Editar" variant="outlined" width={80} height={32} onPress={onStartEdit} />
            <AppButton label="Borrar" width={80} height={32} backgroundColor="$danger" onPress={onDelete} />
          </XStack>
        )
      ) : null}
    </YStack>
  );
}
