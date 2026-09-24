import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';

import { AuthProvider } from '@/presentation/contexts/auth-context';
import tamaguiConfig from '../../tamagui.config';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <AuthProvider>{children}</AuthProvider>
    </TamaguiProvider>
  );
}

/** Renders a screen inside the same providers the root layout mounts (theme + real auth session). */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AppProviders, ...options });
}
