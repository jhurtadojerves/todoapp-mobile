import { Paragraph, Spinner, YStack } from 'tamagui';

import { BoardMembership } from '@/domain/models/membership';
import { MemberRow } from '@/presentation/components/members/member-row';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  members: BoardMembership[];
  isOwner: boolean;
  removingId: number | null;
  onRemove: (membershipId: number) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export function MemberList({
  members,
  isOwner,
  removingId,
  onRemove,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: Props) {
  if (members.length === 0) {
    return (
      <Paragraph color="$muted" fontSize={14}>
        No hay miembros todavía
      </Paragraph>
    );
  }

  return (
    <YStack gap="$2">
      {members.map((membership) => (
        <MemberRow
          key={membership.id}
          membership={membership}
          canRemove={isOwner && membership.role !== 'owner'}
          isRemoving={removingId === membership.id}
          onRemove={onRemove}
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
