import { Paragraph, YStack } from 'tamagui';

import { TaskAttachment } from '@/domain/models/attachment';
import { TaskAttachmentItem } from '@/presentation/components/tasks/task-attachment-item';

type Props = {
  attachments: TaskAttachment[];
  deletingId: string | null;
  onDelete: (id: string) => void;
};

export function TaskAttachmentList({ attachments, deletingId, onDelete }: Props) {
  if (attachments.length === 0) {
    return (
      <Paragraph color="$muted" fontSize={14}>
        No hay fotos adjuntas todavía
      </Paragraph>
    );
  }

  return (
    <YStack gap="$2">
      {attachments.map((attachment) => (
        <TaskAttachmentItem
          key={attachment.id}
          attachment={attachment}
          isDeleting={deletingId === attachment.id}
          onDelete={() => onDelete(attachment.id)}
        />
      ))}
    </YStack>
  );
}
