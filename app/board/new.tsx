import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { BoardFormScreen } from '@/presentation/screens/board-form-screen';

export default function NewBoardRoute() {
  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <HeaderBackButton fallbackHref="/boards" /> }} />
      <BoardFormScreen />
    </>
  );
}
