import { useLocalSearchParams } from 'expo-router';

import { TaskFormScreen } from '@/presentation/screens/task-form-screen';

export default function NewTaskRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TaskFormScreen boardId={Number(id)} />;
}
