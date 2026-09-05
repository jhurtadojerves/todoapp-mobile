import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { BoardDetailScreen } from '@/presentation/screens/board-detail-screen';

export default function BoardDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <HeaderBackButton fallbackHref="/boards" /> }} />
      <BoardDetailScreen boardId={Number(id)} />
    </>
  );
}
