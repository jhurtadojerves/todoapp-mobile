import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Paragraph, ScrollView, YStack } from 'tamagui';

import { AppButton, AppInput, AppTitle } from '@/presentation/components/ui';
import { useAuth } from '@/presentation/contexts/auth-context';
import { useRegisterViewModel } from '@/presentation/viewmodels/use-register-viewmodel';

export function RegisterScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    credentials,
    setField,
    submit,
    error,
    emailError,
    passwordError,
    passwordMatchError,
    passwordValidationErrors,
    isValidatingPassword,
    isAuthenticating,
    canSubmit,
  } = useRegisterViewModel();

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
    <ScrollView flex={1} backgroundColor="$background">
      <YStack flex={1} justifyContent="center" padding="$5" minHeight="100%">
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
          <AppTitle subtitle="Crea una cuenta para comenzar.">Registro</AppTitle>

          <YStack gap="$2">
            <AppInput
              placeholder="Nombre"
              autoCapitalize="words"
              textContentType="givenName"
              value={credentials.first_name}
              onChangeText={(value) => setField('first_name', value)}
            />
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Apellido"
              autoCapitalize="words"
              textContentType="familyName"
              value={credentials.last_name}
              onChangeText={(value) => setField('last_name', value)}
            />
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Correo electrónico"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={credentials.email}
              onChangeText={(value) => setField('email', value)}
            />
            {emailError ? (
              <Paragraph color="$danger" fontSize={13}>
                {emailError}
              </Paragraph>
            ) : null}
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Contraseña"
              secureTextEntry
              textContentType="newPassword"
              value={credentials.password}
              onChangeText={(value) => setField('password', value)}
            />
            {isValidatingPassword ? (
              <Paragraph color="$gray10" fontSize={13}>
                Validando contraseña...
              </Paragraph>
            ) : null}
            {passwordError && !isValidatingPassword ? (
              <Paragraph color="$danger" fontSize={13}>
                {passwordError}
              </Paragraph>
            ) : null}
            {passwordValidationErrors.length > 0 && !isValidatingPassword ? (
              <YStack gap="$1" marginTop="$1">
                {passwordValidationErrors.map((err, index) => (
                  <Paragraph key={index} color="$danger" fontSize={12}>
                    • {err}
                  </Paragraph>
                ))}
              </YStack>
            ) : null}
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Confirmar contraseña"
              secureTextEntry
              textContentType="newPassword"
              value={credentials.password2}
              onChangeText={(value) => setField('password2', value)}
            />
            {passwordMatchError ? (
              <Paragraph color="$danger" fontSize={13}>
                {passwordMatchError}
              </Paragraph>
            ) : null}
          </YStack>

          {error ? (
            <Paragraph color="$danger" marginTop="$2">
              {error}
            </Paragraph>
          ) : null}

          <AppButton
            onPress={handleSubmit}
            disabled={!canSubmit || isAuthenticating}
            loading={isAuthenticating}
            marginTop="$3"
            label="Registrarse"
          />

          <AppButton
            onPress={() => router.back()}
            disabled={isAuthenticating}
            variant="outlined"
            label="Volver al inicio de sesión"
          />
        </YStack>
      </YStack>
    </ScrollView>
  );
}
