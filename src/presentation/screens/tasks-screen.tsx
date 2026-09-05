import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Spinner, XStack, YStack } from 'tamagui';

import { Task } from '@/domain/models/task';
import { TaskList } from '@/presentation/components/tasks/task-list';
import { AppButton } from '@/presentation/components/ui';
import { useTasksViewModel } from '@/presentation/viewmodels/use-tasks-viewmodel';

type Props = {
  boardId: number;
};

export function TasksScreen({ boardId }: Props) {
  const router = useRouter();
  const { tasks, isLoading, isLoadingMore, hasMore, error, loadMore, reload } =
    useTasksViewModel(boardId);

  const handlePressTask = (task: Task) => {
    router.push(`/board/${boardId}/tasks/${task.id}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$3">
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
          <YStack gap="$2" flex={1}>
            <Paragraph fontSize={22} fontWeight="700" color="$text" numberOfLines={2}>
              Tareas
            </Paragraph>
            <Paragraph color="$muted" fontSize={14} numberOfLines={3}>
              Todas las tareas de este tablero.
            </Paragraph>
          </YStack>
          <AppButton
            label="Nueva"
            width={100}
            height={44}
            onPress={() => router.push(`/board/${boardId}/tasks/new` as any)}
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
          <TaskList
            tasks={tasks}
            onPressTask={handlePressTask}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
