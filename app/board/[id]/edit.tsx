import { Stack, useLocalSearchParams } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { BoardFormScreen } from '@/presentation/screens/board-form-screen';

export default function EditBoardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{ headerLeft: () => <HeaderBackButton fallbackHref={`/board/${id}`} /> }}
      />
      <BoardFormScreen boardId={Number(id)} />
    </>
  );
}
