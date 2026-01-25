import { useRouter } from 'expo-router';
import { Button, Paragraph, Popover } from 'tamagui';

import { useAuth } from '@/presentation/contexts/auth-context';

type Props = {
  onNavigateHomeAfterLogout?: boolean;
};

export function HeaderMenu({ onNavigateHomeAfterLogout = true }: Props) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handlePress = () => {
    if (isAuthenticated) {
      logout();
      if (onNavigateHomeAfterLogout) {
        router.replace('/home');
      }
    } else {
      router.push('/users');
    }
  };

  return (
    <Popover placement="bottom-end" allowFlip stayInFrame size="$4">
      <Popover.Trigger asChild>
        <Button
          unstyled
          width={38}
          height={38}
          borderRadius={19}
          alignItems="center"
          justifyContent="center"
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: '$backgroundSoft' }}
        >
          <Paragraph color="$text" fontSize={20} fontWeight="700">
            ≡
          </Paragraph>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        padding="$3"
        borderWidth={1}
        borderColor="$border"
        backgroundColor="$background"
        elevate
        width={200}
        zIndex={1000}
      >
        <Popover.Close asChild>
          <Button unstyled onPress={handlePress} justifyContent="flex-start">
            <Paragraph color="$text" fontSize={16}>
              {isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'}
            </Paragraph>
          </Button>
        </Popover.Close>
      </Popover.Content>
    </Popover>
  );
}
