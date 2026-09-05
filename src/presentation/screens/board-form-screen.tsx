import { useRouter } from 'expo-router';
import { Paragraph, ScrollView, Spinner, YStack } from 'tamagui';

import { AppButton, AppInput, AppTitle } from '@/presentation/components/ui';
import { useBoardFormViewModel } from '@/presentation/viewmodels/use-board-form-viewmodel';

type Props = {
  boardId?: number;
};

export function BoardFormScreen({ boardId }: Props) {
  const router = useRouter();
  const { fields, setField, submit, isEditing, isLoading, isSubmitting, error, nameError, canSubmit } =
    useBoardFormViewModel(boardId);

  const handleSubmit = async () => {
    try {
      await submit();
      router.back();
    } catch {
    }
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner />
      </YStack>
    );
  }

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
          <AppTitle subtitle={isEditing ? 'Actualizá los datos del tablero.' : 'Dale un nombre a tu nuevo tablero.'}>
            {isEditing ? 'Editar tablero' : 'Nuevo tablero'}
          </AppTitle>

          <YStack gap="$2">
            <AppInput
              placeholder="Nombre"
              value={fields.name}
              onChangeText={(value) => setField('name', value)}
            />
            {nameError ? (
              <Paragraph color="$danger" fontSize={13}>
                {nameError}
              </Paragraph>
            ) : null}
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Descripción"
              value={fields.description}
              onChangeText={(value) => setField('description', value)}
              multiline
              numberOfLines={4}
              height={100}
              textAlignVertical="top"
              paddingTop="$3"
            />
          </YStack>

          {error ? (
            <Paragraph color="$danger" marginTop="$2">
              {error}
            </Paragraph>
          ) : null}

          <AppButton
            loading={isSubmitting}
            disabled={!canSubmit}
            onPress={handleSubmit}
            marginTop="$3"
            label={isEditing ? 'Guardar cambios' : 'Crear tablero'}
          />

          <AppButton
            variant="outlined"
            onPress={() => router.back()}
            label="Cancelar"
          />
        </YStack>
      </YStack>
    </ScrollView>
  );
}
