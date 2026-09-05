import { Paragraph, Spinner, YStack } from 'tamagui';

import { Sprint } from '@/domain/models/sprint';
import { SprintRow } from '@/presentation/components/sprints/sprint-row';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  sprints: Sprint[];
  canManage: boolean;
  editingId: number | null;
  editName: string;
  onEditNameChange: (value: string) => void;
  editStartDate: string;
  onEditStartDateChange: (value: string) => void;
  editEndDate: string;
  onEditEndDateChange: (value: string) => void;
  isSavingEdit: boolean;
  editError: string | null;
  onStartEdit: (sprint: Sprint) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  deletingId: number | null;
  onDelete: (id: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export function SprintList({
  sprints,
  canManage,
  editingId,
  editName,
  onEditNameChange,
  editStartDate,
  onEditStartDateChange,
  editEndDate,
  onEditEndDateChange,
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
  if (sprints.length === 0) {
    return (
      <Paragraph color="$muted" fontSize={14}>
        No hay sprints todavía
      </Paragraph>
    );
  }

  return (
    <YStack gap="$2">
      {sprints.map((sprint) => (
        <SprintRow
          key={sprint.id}
          sprint={sprint}
          canManage={canManage}
          isEditing={editingId === sprint.id}
          editName={editName}
          onEditNameChange={onEditNameChange}
          editStartDate={editStartDate}
          onEditStartDateChange={onEditStartDateChange}
          editEndDate={editEndDate}
          onEditEndDateChange={onEditEndDateChange}
          isSaving={isSavingEdit}
          editError={editError}
          onStartEdit={() => onStartEdit(sprint)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          isDeleting={deletingId === sprint.id}
          onDelete={() => onDelete(sprint.id)}
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
