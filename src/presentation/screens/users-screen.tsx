import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Spinner, YStack } from 'tamagui';

import { UserList } from '@/presentation/components/users/user-list';
import { AppButton } from '@/presentation/components/ui';
import { useUsersViewModel } from '@/presentation/viewmodels/use-users-viewmodel';

export function UsersScreen() {
  const { users, isLoading, isLoadingMore, hasMore, loadMore, error, reload } = useUsersViewModel();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$3">
        <YStack gap="$2" width="100%">
          <Paragraph fontSize={22} fontWeight="700" color="$text" numberOfLines={2}>
            Listado de usuarios
          </Paragraph>
          <Paragraph color="$muted" fontSize={14} numberOfLines={3}>
            Esta vista consume la API de usuarios solo disponible para sesiones autenticadas.
          </Paragraph>
        </YStack>

        {isLoading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner />
          </YStack>
        ) : error ? (
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
            <Paragraph color="$danger" textAlign="center">
              {error}
            </Paragraph>
            <AppButton label="Reintentar" variant="outlined" width={160} onPress={reload} />
          </YStack>
        ) : (
          <UserList
            users={users}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
