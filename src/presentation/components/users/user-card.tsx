import { Paragraph, XStack, YStack } from 'tamagui';

import { User } from '@/domain/models/user';

type Props = {
  user: User;
};

export function UserCard({ user }: Props) {
  return (
    <YStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      gap="$2"
    >
      <XStack gap="$3" alignItems="center">
        <YStack
          width={42}
          height={42}
          borderRadius={21}
          backgroundColor="$primary"
          alignItems="center"
          justifyContent="center"
        >
          <Paragraph color="$primaryContrast" fontWeight="700">
            {user.firstName?.charAt(0).toUpperCase()}
          </Paragraph>
        </YStack>
        <YStack gap="$1">
          <Paragraph fontWeight="700" color="$text" fontSize={16}>
            {user.firstName} {user.lastName}
          </Paragraph>
          <Paragraph color="$muted" fontSize={14}>
            {user.email}
          </Paragraph>
        </YStack>
      </XStack>
      <Paragraph color="$text" fontSize={14}>
        {user.profile?.bio || 'Sin bio'}
      </Paragraph>
    </YStack>
  );
}
