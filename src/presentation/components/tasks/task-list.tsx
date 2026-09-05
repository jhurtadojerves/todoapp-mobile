import { FlatList, ListRenderItemInfo } from 'react-native';
import { Paragraph, Separator, Spinner } from 'tamagui';

import { Task } from '@/domain/models/task';
import { TaskCard } from '@/presentation/components/tasks/task-card';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  tasks: Task[];
  onPressTask?: (task: Task) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
};

export function TaskList({ tasks, onPressTask, hasMore, isLoadingMore, onLoadMore }: Props) {
  const renderTask = ({ item }: ListRenderItemInfo<Task>) => (
    <TaskCard task={item} onPress={onPressTask} />
  );

  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <Separator height={12} />}
      ListEmptyComponent={
        <Paragraph color="$muted" textAlign="center">
          No hay tareas todavía
        </Paragraph>
      }
      ListFooterComponent={
        hasMore ? (
          isLoadingMore ? (
            <Spinner marginTop="$3" />
          ) : (
            <AppButton
              label="Cargar más"
              variant="outlined"
              marginTop="$3"
              onPress={onLoadMore}
            />
          )
        ) : null
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8, gap: 12 }}
    />
  );
}
