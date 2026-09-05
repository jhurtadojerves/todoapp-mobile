import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/presentation/components/ui';
import { RegisterScreen } from '@/presentation/screens/register-screen';

export default function RegisterRoute() {
  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <HeaderBackButton fallbackHref="/" /> }} />
      <RegisterScreen />
    </>
  );
}
