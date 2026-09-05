import { Button, Paragraph, XStack, YStack } from 'tamagui';

export type ChipOption = {
  id: number | null;
  label: string;
};

type Props = {
  label: string;
  options: ChipOption[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
};

export function ChipPicker({ label, options, selectedId, onSelect }: Props) {
  return (
    <YStack gap="$2">
      <Paragraph fontSize={13} color="$muted">
        {label}
      </Paragraph>
      <XStack flexWrap="wrap" gap="$2">
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <Button
              key={String(option.id)}
              size="$3"
              borderWidth={1}
              borderColor={isSelected ? '$primary' : '$border'}
              backgroundColor={isSelected ? '$primary' : '$backgroundSoft'}
              onPress={() => onSelect(option.id)}
            >
              <Paragraph color={isSelected ? '$primaryContrast' : '$text'} fontSize={13}>
                {option.label}
              </Paragraph>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}
