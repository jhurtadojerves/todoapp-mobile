import { Input, type InputProps } from 'tamagui';

export type AppInputProps = InputProps;

export function AppInput(props: AppInputProps) {
  const {
    borderWidth = 1.5,
    borderColor = '$border',
    borderRadius = '$3',
    paddingHorizontal = '$3',
    paddingVertical = '$3',
    height = 52,
    textAlignVertical = 'center',
    backgroundColor = '#ffffff',
    color = '#0f172a',
    fontSize = 16,
    lineHeight = 22,
    placeholderTextColor = '#334155',
    selectionColor = '$primary',
    cursorColor = '$primary',
    focusStyle = { borderColor: '$primary', backgroundColor: '#ffffff' },
    underlineColorAndroid = 'transparent',
    placeholder,
    // Every call site already sets a placeholder describing the field, so
    // default the a11y label to it instead of requiring it at every usage.
    accessibilityLabel = placeholder,
    ...rest
  } = props;

  return (
    <Input
      borderWidth={borderWidth}
      borderColor={borderColor}
      borderRadius={borderRadius}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      height={height}
      textAlignVertical={textAlignVertical}
      backgroundColor={backgroundColor}
      color={color}
      fontSize={fontSize}
      lineHeight={lineHeight}
      placeholderTextColor={placeholderTextColor}
      selectionColor={selectionColor}
      cursorColor={cursorColor}
      focusStyle={focusStyle}
      underlineColorAndroid={underlineColorAndroid}
      placeholder={placeholder}
      accessibilityLabel={accessibilityLabel}
      {...rest}
    />
  );
}
