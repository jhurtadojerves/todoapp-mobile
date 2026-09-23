import { Stack } from 'expo-router';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
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
        <AuthProvider>
          <Stack>
            {/* Tabs render their own header (see (tabs)/_layout.tsx), so hide the stack's. */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ title: 'Registro' }} />
            <Stack.Screen name="board/new" options={{ title: 'Nuevo tablero' }} />
            <Stack.Screen name="board/[id]/index" options={{ title: 'Tablero' }} />
            <Stack.Screen name="board/[id]/edit" options={{ title: 'Editar tablero' }} />
            <Stack.Screen name="board/[id]/tasks/index" options={{ title: 'Tareas' }} />
            <Stack.Screen name="board/[id]/tasks/new" options={{ title: 'Nueva tarea' }} />
            <Stack.Screen
              name="board/[id]/tasks/[taskId]/index"
              options={{ title: 'Tarea' }}
            />
            <Stack.Screen
              name="board/[id]/tasks/[taskId]/edit"
              options={{ title: 'Editar tarea' }}
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthProvider>
      </TamaguiProvider>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}
