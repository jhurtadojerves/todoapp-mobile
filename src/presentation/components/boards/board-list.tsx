import { FlatList, ListRenderItemInfo } from 'react-native';
import { Paragraph, Separator } from 'tamagui';

import { Board } from '@/domain/models/board';
import { BoardCard } from '@/presentation/components/boards/board-card';

type Props = {
  boards: Board[];
  onPressBoard?: (board: Board) => void;
};

export function BoardList({ boards, onPressBoard }: Props) {
  const renderBoard = ({ item }: ListRenderItemInfo<Board>) => (
    <BoardCard board={item} onPress={onPressBoard} />
  );

  return (
    <FlatList
      data={boards}
      renderItem={renderBoard}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <Separator height={12} />}
      ListEmptyComponent={
        <Paragraph color="$muted" textAlign="center">
          No hay tableros todavía
        </Paragraph>
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8, gap: 12 }}
    />
  );
}
