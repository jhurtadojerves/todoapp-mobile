import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { TaskDetailScreen } from '@/presentation/screens/task-detail-screen';

export default function TaskDetailRoute() {
  const { id, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <HeaderBackButton fallbackHref={`/board/${id}/tasks`} /> }}
      />
      <TaskDetailScreen boardId={Number(id)} taskId={Number(taskId)} />
    </>
  );
}
