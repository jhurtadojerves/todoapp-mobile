import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { TaskFormScreen } from '@/presentation/screens/task-form-screen';

export default function EditTaskRoute() {
  const { id, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderBackButton fallbackHref={`/board/${id}/tasks/${taskId}`} />,
        }}
      />
      <TaskFormScreen boardId={Number(id)} taskId={Number(taskId)} />
    </>
  );
}
