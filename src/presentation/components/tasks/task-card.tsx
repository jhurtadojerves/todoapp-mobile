import { Paragraph, XStack, YStack } from 'tamagui';

import { Task } from '@/domain/models/task';

type Props = {
  task: Task;
  onPress?: (task: Task) => void;
};

export function TaskCard({ task, onPress }: Props) {
  return (
    <YStack
      backgroundColor="$backgroundSoft"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$border"
      padding="$3"
      gap="$2"
      onPress={onPress ? () => onPress(task) : undefined}
      pressStyle={onPress ? { opacity: 0.7 } : undefined}
    >
      <Paragraph fontWeight="700" color="$text" fontSize={15} numberOfLines={2}>
        {task.title}
      </Paragraph>

      <XStack gap="$2" alignItems="center" flexWrap="wrap">
        {task.status ? (
          <XStack alignItems="center" gap="$1">
            <YStack width={10} height={10} borderRadius={5} backgroundColor={task.status.color || '$muted'} />
            <Paragraph color="$muted" fontSize={12}>
              {task.status.name}
            </Paragraph>
          </XStack>
        ) : null}
        {task.sprint ? (
          <Paragraph color="$muted" fontSize={12}>
            {task.status ? '· ' : ''}
            {task.sprint.name}
          </Paragraph>
        ) : null}
      </XStack>
    </YStack>
  );
}
