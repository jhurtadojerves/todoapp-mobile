import { FlatList, ListRenderItemInfo } from 'react-native';
import { Paragraph, Separator, Spinner } from 'tamagui';

import { Board } from '@/domain/models/board';
import { BoardCard } from '@/presentation/components/boards/board-card';
import { AppButton } from '@/presentation/components/ui';

type Props = {
  boards: Board[];
  onPressBoard?: (board: Board) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export function BoardList({ boards, onPressBoard, hasMore, isLoadingMore, onLoadMore }: Props) {
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
      ListFooterComponent={
        hasMore ? (
          isLoadingMore ? (
            <Spinner marginTop="$3" />
          ) : (
            <AppButton label="Cargar más" variant="outlined" marginTop="$3" onPress={onLoadMore} />
          )
        ) : null
      }
      contentContainerStyle={{ flexGrow: 1, paddingVertical: 8, gap: 12 }}
    />
  );
}
