import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TamaguiProvider } from 'tamagui';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/presentation/contexts/auth-context';
import tamaguiConfig from '@/tamagui.config';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const defaultTheme = colorScheme === 'dark' ? 'dark' : 'light';
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={defaultTheme}>
        <PortalProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </PortalProvider>
      </TamaguiProvider>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}
