import { Button, Paragraph, Spinner, type ButtonProps } from 'tamagui';

export type AppButtonProps = ButtonProps & {
  label: string;
  loading?: boolean;
};

export function AppButton({ label, loading, disabled, ...rest }: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      borderRadius="$3"
      backgroundColor="$primary"
      paddingVertical="$3"
      height={52}
      justifyContent="center"
      pressStyle={{ backgroundColor: '$primary' }}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Spinner color="$primaryContrast" />
      ) : (
        <Paragraph color="$primaryContrast" fontWeight="700" fontSize={16} textAlign="center">
          {label}
        </Paragraph>
      )}
    </Button>
  );
}
