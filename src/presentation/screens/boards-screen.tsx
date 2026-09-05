import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { Board } from '@/domain/models/board';
import { BoardList } from '@/presentation/components/boards/board-list';
import { AppButton } from '@/presentation/components/ui';
import { useBoardsViewModel } from '@/presentation/viewmodels/use-boards-viewmodel';

export function BoardsScreen() {
  const router = useRouter();
  const { boards, isLoading, isLoadingMore, hasMore, error, loadMore, reload } = useBoardsViewModel();

  const handlePressBoard = (board: Board) => {
    router.push(`/board/${board.id}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$3">
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
          <YStack gap="$2" flex={1}>
            <Paragraph fontSize={22} fontWeight="700" color="$text" numberOfLines={2}>
              Mis tableros
            </Paragraph>
            <Paragraph color="$muted" fontSize={14} numberOfLines={3}>
              Organizá tus tareas en tableros.
            </Paragraph>
          </YStack>
          <AppButton
            label="Nuevo"
            width={100}
            height={44}
            onPress={() => router.push('/board/new' as any)}
          />
        </XStack>

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
          <BoardList
            boards={boards}
            onPressBoard={handlePressBoard}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
