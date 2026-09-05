import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, Spinner, YStack } from 'tamagui';

import { AppButton } from '@/presentation/components/ui';
import { useBoardDetailViewModel } from '@/presentation/viewmodels/use-board-detail-viewmodel';

type Props = {
  boardId: number;
};

export function BoardDetailScreen({ boardId }: Props) {
  const router = useRouter();
  const { board, isLoading, error, isDeleting, deleteError, deleteBoard } =
    useBoardDetailViewModel(boardId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar tablero',
      '¿Seguro que querés eliminar este tablero? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setConfirmingDelete(true);
            try {
              await deleteBoard();
              router.replace('/boards' as any);
            } catch {
              setConfirmingDelete(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
        <Spinner />
      </YStack>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right']}>
      <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
        {error ? (
          <Paragraph color="$danger">{error}</Paragraph>
        ) : board ? (
          <>
            <YStack gap="$2">
              <Paragraph fontSize={24} fontWeight="700" color="$text">
                {board.name}
              </Paragraph>
              <Paragraph color="$muted" fontSize={16}>
                {board.description || 'Sin descripción'}
              </Paragraph>
            </YStack>

            {deleteError ? <Paragraph color="$danger">{deleteError}</Paragraph> : null}

            <YStack gap="$3" marginTop="$4">
              <AppButton
                label="Editar"
                variant="outlined"
                onPress={() => router.push(`/board/${board.id}/edit` as any)}
              />
              <AppButton
                label="Eliminar tablero"
                loading={isDeleting || confirmingDelete}
                onPress={handleDelete}
                backgroundColor="$danger"
              />
            </YStack>
          </>
        ) : null}
      </YStack>
    </SafeAreaView>
  );
}
