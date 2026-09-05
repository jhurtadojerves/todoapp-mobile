import { Button, Paragraph, Spinner, type ButtonProps } from 'tamagui';

export type AppButtonProps = Omit<ButtonProps, 'variant'> & {
  label: string;
  loading?: boolean;
  variant?: 'filled' | 'outlined';
};

export function AppButton({ label, loading, disabled, variant = 'filled', ...rest }: AppButtonProps) {
  const isDisabled = disabled || loading;
  
  const isOutlined = variant === 'outlined';

  return (
    <Button
      borderRadius="$3"
      backgroundColor={isOutlined ? 'transparent' : '$primary'}
      borderWidth={isOutlined ? 1.5 : 0}
      borderColor={isOutlined ? '$primary' : undefined}
      paddingVertical="$3"
      height={52}
      justifyContent="center"
      pressStyle={{ 
        backgroundColor: isOutlined ? '$gray2' : '$primary',
      }}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <Spinner color={isOutlined ? '$primary' : '$primaryContrast'} />
      ) : (
        <Paragraph 
          color={isOutlined ? '$primary' : '$primaryContrast'} 
          fontWeight="700" 
          fontSize={16} 
          textAlign="center"
        >
          {label}
        </Paragraph>
      )}
    </Button>
  );
}
