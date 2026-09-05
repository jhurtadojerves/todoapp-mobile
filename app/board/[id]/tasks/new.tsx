import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { TaskFormScreen } from '@/presentation/screens/task-form-screen';

export default function NewTaskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <HeaderBackButton fallbackHref={`/board/${id}/tasks`} /> }}
      />
      <TaskFormScreen boardId={Number(id)} />
    </>
  );
}
