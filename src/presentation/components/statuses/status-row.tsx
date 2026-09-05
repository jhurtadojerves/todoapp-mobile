import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { BoardStatus } from '@/domain/models/status';
import { AppButton, AppInput } from '@/presentation/components/ui';

type Props = {
  status: BoardStatus;
  canManage: boolean;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  isSaving: boolean;
  editError: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  isDeleting: boolean;
  onDelete: () => void;
};

export function StatusRow({
  status,
  canManage,
  isEditing,
  editName,
  onEditNameChange,
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
        <AppInput value={editName} onChangeText={onEditNameChange} placeholder="Nombre" />
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
            disabled={!editName.trim() || isSaving}
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
    <XStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      alignItems="center"
      justifyContent="space-between"
      gap="$3"
    >
      <XStack alignItems="center" gap="$3" flex={1}>
        <YStack width={14} height={14} borderRadius={7} backgroundColor={status.color || '$muted'} />
        <Paragraph fontWeight="700" color="$text" fontSize={15} numberOfLines={1}>
          {status.name}
        </Paragraph>
      </XStack>

      {canManage ? (
        isDeleting ? (
          <Spinner size="small" />
        ) : (
          <XStack gap="$2">
            <AppButton label="Editar" variant="outlined" width={80} height={36} onPress={onStartEdit} />
            <AppButton label="Borrar" width={80} height={36} backgroundColor="$danger" onPress={onDelete} />
          </XStack>
        )
      ) : null}
    </XStack>
  );
}
