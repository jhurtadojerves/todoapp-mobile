import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { Sprint } from '@/domain/models/sprint';
import { AppButton, AppInput } from '@/presentation/components/ui';

type Props = {
  sprint: Sprint;
  canManage: boolean;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (value: string) => void;
  editStartDate: string;
  onEditStartDateChange: (value: string) => void;
  editEndDate: string;
  onEditEndDateChange: (value: string) => void;
  isSaving: boolean;
  editError: string | null;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  isDeleting: boolean;
  onDelete: () => void;
};

export function SprintRow({
  sprint,
  canManage,
  isEditing,
  editName,
  onEditNameChange,
  editStartDate,
  onEditStartDateChange,
  editEndDate,
  onEditEndDateChange,
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
        <XStack gap="$2">
          <AppInput
            flex={1}
            value={editStartDate}
            onChangeText={onEditStartDateChange}
            placeholder="Inicio (AAAA-MM-DD)"
          />
          <AppInput
            flex={1}
            value={editEndDate}
            onChangeText={onEditEndDateChange}
            placeholder="Fin (AAAA-MM-DD)"
          />
        </XStack>
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
      <YStack flex={1} gap="$1">
        <Paragraph fontWeight="700" color="$text" fontSize={15} numberOfLines={1}>
          {sprint.name}
        </Paragraph>
        {sprint.start_date || sprint.end_date ? (
          <Paragraph color="$muted" fontSize={13}>
            {sprint.start_date ?? '—'} → {sprint.end_date ?? '—'}
          </Paragraph>
        ) : null}
      </YStack>

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
