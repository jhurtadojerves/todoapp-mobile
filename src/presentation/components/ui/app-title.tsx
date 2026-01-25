import { Paragraph, type ParagraphProps, YStack } from 'tamagui';

export type AppTitleProps = ParagraphProps & {
  subtitle?: string;
};

export function AppTitle({ children, subtitle, ...rest }: AppTitleProps) {
  return (
    <YStack alignItems="center" gap="$2">
      <Paragraph
        fontSize={34}
        lineHeight={40}
        fontWeight="700"
        color="$text"
        textAlign="center"
        {...rest}
      >
        {children}
      </Paragraph>
      {subtitle ? (
        <Paragraph color="$muted" textAlign="center">
          {subtitle}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
