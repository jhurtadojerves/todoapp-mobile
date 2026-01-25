import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';

import { AppTitle } from '@/presentation/components/ui';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <YStack flex={1} padding="$5" backgroundColor="$background" gap="$4" justifyContent="center">
      <AppTitle subtitle="Administra tus tareas y accede a un listado protegido de usuarios">
        Bienvenido a TodoApp
      </AppTitle>
    </YStack>
  );
}
