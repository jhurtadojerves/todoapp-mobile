import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { BoardMembership } from '@/domain/models/membership';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  membership: BoardMembership;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: (membershipId: number) => void;
};

export function MemberRow({ membership, canRemove, isRemoving, onRemove }: Props) {
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
          {membership.user.username}
        </Paragraph>
        <Paragraph color="$muted" fontSize={13} numberOfLines={1}>
          {membership.user.email}
        </Paragraph>
      </YStack>

      <Paragraph
        color={membership.role === 'owner' ? '$primary' : '$muted'}
        fontWeight="700"
        fontSize={12}
        textTransform="uppercase"
      >
        {membership.role === 'owner' ? 'Owner' : 'Member'}
      </Paragraph>

      {canRemove ? (
        isRemoving ? (
          <Spinner size="small" />
        ) : (
          <AppButton
            label="Quitar"
            variant="outlined"
            width={80}
            height={36}
            onPress={() => onRemove(membership.id)}
          />
        )
      ) : null}
    </XStack>
  );
}
