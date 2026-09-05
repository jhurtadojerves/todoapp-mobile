import { useLocalSearchParams } from 'expo-router';

import { TaskFormScreen } from '@/presentation/screens/task-form-screen';

export default function EditTaskRoute() {
  const { id, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();

  return <TaskFormScreen boardId={Number(id)} taskId={Number(taskId)} />;
}
