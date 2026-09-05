import { Paragraph, YStack } from 'tamagui';

import { BoardStatus } from '@/domain/models/status';
import { StatusRow } from '@/presentation/components/statuses/status-row';

type Props = {
  statuses: BoardStatus[];
  canManage: boolean;
  editingId: number | null;
  editName: string;
  onEditNameChange: (value: string) => void;
  isSavingEdit: boolean;
  editError: string | null;
  onStartEdit: (status: BoardStatus) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  deletingId: number | null;
  onDelete: (id: number) => void;
};

export function StatusList({
  statuses,
  canManage,
  editingId,
  editName,
  onEditNameChange,
  isSavingEdit,
  editError,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  deletingId,
  onDelete,
}: Props) {
  if (statuses.length === 0) {
    return (
      <Paragraph color="$muted" fontSize={14}>
        No hay estados todavía
      </Paragraph>
    );
  }

  return (
    <YStack gap="$2">
      {statuses.map((status) => (
        <StatusRow
          key={status.id}
          status={status}
          canManage={canManage}
          isEditing={editingId === status.id}
          editName={editName}
          onEditNameChange={onEditNameChange}
          isSaving={isSavingEdit}
          editError={editError}
          onStartEdit={() => onStartEdit(status)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
          isDeleting={deletingId === status.id}
          onDelete={() => onDelete(status.id)}
        />
      ))}
    </YStack>
  );
}
