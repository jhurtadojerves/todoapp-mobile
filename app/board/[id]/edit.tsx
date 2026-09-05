import { useLocalSearchParams } from 'expo-router';

import { BoardFormScreen } from '@/presentation/screens/board-form-screen';

export default function EditBoardRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <BoardFormScreen boardId={Number(id)} />;
}
