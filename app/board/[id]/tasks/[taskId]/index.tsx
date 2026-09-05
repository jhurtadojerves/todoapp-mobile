import { useLocalSearchParams } from 'expo-router';

import { TaskDetailScreen } from '@/presentation/screens/task-detail-screen';

export default function TaskDetailRoute() {
  const { id, taskId } = useLocalSearchParams<{ id: string; taskId: string }>();

  return <TaskDetailScreen boardId={Number(id)} taskId={Number(taskId)} />;
}
