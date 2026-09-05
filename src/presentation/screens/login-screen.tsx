import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Paragraph, YStack, XStack } from 'tamagui';

import { AppButton, AppInput, AppTitle } from '@/presentation/components/ui';
import { useAuth } from '@/presentation/contexts/auth-context';
import { useLoginViewModel } from '@/presentation/viewmodels/use-login-viewmodel';

export function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { credentials, setField, submit, error, isAuthenticating } = useLoginViewModel();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/users');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    try {
      await submit();
      router.replace('/users');
    } catch {
    }
  };

  return (
    <YStack flex={1} justifyContent="center" backgroundColor="$background" padding="$5">
      <YStack
        marginHorizontal="auto"
        width="100%"
        maxWidth={420}
        borderColor="$border"
        borderWidth={1}
        borderRadius="$3"
        backgroundColor="$backgroundSoft"
        padding="$5"
        gap="$3"
      >
        <AppTitle subtitle="Inicia sesión para acceder al listado protegido.">TodoApp</AppTitle>

        <AppInput
          placeholder="Correo electrónico"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="username"
          value={credentials.email}
          onChangeText={(value) => setField('email', value)}
        />

        <AppInput
          placeholder="Contraseña"
          secureTextEntry
          textContentType="password"
          value={credentials.password}
          onChangeText={(value) => setField('password', value)}
        />

        {error ? (
          <Paragraph color="$danger" marginTop="$2">
            {error}
          </Paragraph>
        ) : null}

        <AppButton
          onPress={handleSubmit}
          disabled={isAuthenticating}
          loading={isAuthenticating}
          marginTop="$3"
          label="Acceder"
        />

        <XStack justifyContent="center" alignItems="center" marginTop="$4" gap="$2">
          <Paragraph color="$gray11" fontSize={14}>
            ¿No tienes cuenta?
          </Paragraph>
          <Paragraph
            color="$primary"
            fontSize={14}
            fontWeight="600"
            onPress={() => router.push('/register' as any)}
            pressStyle={{ opacity: 0.7 }}
          >
            Regístrate
          </Paragraph>
        </XStack>
      </YStack>
    </YStack>
  );
}
