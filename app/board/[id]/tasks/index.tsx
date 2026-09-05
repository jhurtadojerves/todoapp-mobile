import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { TasksScreen } from '@/presentation/screens/tasks-screen';

export default function TasksRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <HeaderBackButton fallbackHref={`/board/${id}`} /> }}
      />
      <TasksScreen boardId={Number(id)} />
    </>
  );
}
