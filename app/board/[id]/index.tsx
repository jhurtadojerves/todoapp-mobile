import { useLocalSearchParams } from 'expo-router';

import { BoardDetailScreen } from '@/presentation/screens/board-detail-screen';

export default function BoardDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <BoardDetailScreen boardId={Number(id)} />;
}
