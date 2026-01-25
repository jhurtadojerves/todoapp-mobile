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
      {...rest}
    />
  );
}
