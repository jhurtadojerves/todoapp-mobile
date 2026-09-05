import { useLocalSearchParams } from 'expo-router';

import { TasksScreen } from '@/presentation/screens/tasks-screen';

export default function TasksRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <TasksScreen boardId={Number(id)} />;
}
