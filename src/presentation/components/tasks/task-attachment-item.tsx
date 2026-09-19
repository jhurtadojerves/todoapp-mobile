import { Image } from 'expo-image';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { TaskAttachment } from '@/domain/models/attachment';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  attachment: TaskAttachment;
  isDeleting: boolean;
  onDelete: () => void;
};

export function TaskAttachmentItem({ attachment, isDeleting, onDelete }: Props) {
  const hasLocation = attachment.latitude !== null && attachment.longitude !== null;

  return (
    <XStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      gap="$3"
      alignItems="center"
    >
      <Image
        source={{ uri: attachment.photoUri }}
        style={{ width: 64, height: 64, borderRadius: 8 }}
        contentFit="cover"
      />

      <YStack flex={1} gap="$1">
        <Paragraph color="$muted" fontSize={12}>
          {new Date(attachment.createdAt).toLocaleString()}
        </Paragraph>
        <Paragraph color="$text" fontSize={13}>
          {hasLocation
            ? `📍 ${attachment.latitude!.toFixed(5)}, ${attachment.longitude!.toFixed(5)}`
            : 'Sin ubicación'}
        </Paragraph>
      </YStack>

      {isDeleting ? (
        <Spinner size="small" />
      ) : (
        <AppButton label="Borrar" width={80} height={32} backgroundColor="$danger" onPress={onDelete} />
      )}
    </XStack>
  );
}
