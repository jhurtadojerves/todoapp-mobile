import { Paragraph, YStack } from 'tamagui';

import { Board } from '@/domain/models/board';

type Props = {
  board: Board;
  onPress?: (board: Board) => void;
};

export function BoardCard({ board, onPress }: Props) {
  return (
    <YStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      gap="$1"
      onPress={onPress ? () => onPress(board) : undefined}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <Paragraph fontWeight="700" color="$text" fontSize={16} numberOfLines={1}>
        {board.name}
      </Paragraph>
      <Paragraph color="$muted" fontSize={14} numberOfLines={2}>
        {board.description || 'Sin descripción'}
      </Paragraph>
    </YStack>
  );
}
