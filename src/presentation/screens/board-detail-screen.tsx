import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, ScrollView, Spinner, YStack } from 'tamagui';

import { MemberList } from '@/presentation/components/members/member-list';
import { StatusList } from '@/presentation/components/statuses/status-list';
import { AppButton, AppInput } from '@/presentation/components/ui';
import { useBoardDetailViewModel } from '@/presentation/viewmodels/use-board-detail-viewmodel';
import { useBoardMembersViewModel } from '@/presentation/viewmodels/use-board-members-viewmodel';
import { useBoardStatusesViewModel } from '@/presentation/viewmodels/use-board-statuses-viewmodel';
import { confirmAction } from '@/shared/utils/confirm';

type Props = {
  boardId: number;
};

export function BoardDetailScreen({ boardId }: Props) {
  const router = useRouter();
  const { board, isLoading, error, isDeleting, deleteError, deleteBoard } =
    useBoardDetailViewModel(boardId);
  const {
    members,
    isLoading: isLoadingMembers,
    error: membersError,
    isOwner,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteError,
    inviteMember,
    removingId,
    removeError,
    removeMember,
  } = useBoardMembersViewModel(boardId);
  const {
    statuses,
    isLoading: isLoadingStatuses,
    error: statusesError,
    newName,
    setNewName,
    isCreating,
    createError,
    createStatus,
    editingId,
    editName,
    setEditName,
    startEdit,
    cancelEdit,
    isSavingEdit,
    editError,
    saveEdit,
    deletingId: deletingStatusId,
    deleteError: deleteStatusError,
    deleteStatus,
  } = useBoardStatusesViewModel(boardId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: 'Eliminar tablero',
      message: '¿Seguro que querés eliminar este tablero? Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
    });
    if (!confirmed) return;

    setConfirmingDelete(true);
    try {
      await deleteBoard();
      router.replace('/boards' as any);
    } catch {
      setConfirmingDelete(false);
    }
  };

  const handleInvite = async () => {
    try {
      await inviteMember();
    } catch {
    }
  };

  const handleRemove = async (membershipId: number) => {
    const confirmed = await confirmAction({
      title: 'Quitar miembro',
      message: '¿Seguro que querés quitar a este miembro del tablero?',
      confirmLabel: 'Quitar',
    });
    if (!confirmed) return;

    removeMember(membershipId).catch(() => {});
  };

  const handleCreateStatus = async () => {
    try {
      await createStatus();
    } catch {
    }
  };

  const handleSaveStatusEdit = async () => {
    try {
      await saveEdit();
    } catch {
    }
  };

  const handleDeleteStatus = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Borrar estado',
      message: '¿Seguro que querés borrar este estado?',
      confirmLabel: 'Borrar',
    });
    if (!confirmed) return;

    deleteStatus(id).catch(() => {});
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
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$4" gap="$4">
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

              {isOwner ? (
                <YStack gap="$3">
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
              ) : null}

              <YStack gap="$3" borderTopWidth={1} borderColor="$border" paddingTop="$4">
                <Paragraph fontSize={18} fontWeight="700" color="$text">
                  Miembros
                </Paragraph>

                {isOwner ? (
                  <YStack gap="$2">
                    <AppInput
                      placeholder="Correo electrónico"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                    />
                    {inviteError ? (
                      <Paragraph color="$danger" fontSize={13}>
                        {inviteError}
                      </Paragraph>
                    ) : null}
                    <AppButton
                      label="Invitar"
                      loading={isInviting}
                      disabled={!inviteEmail.trim() || isInviting}
                      onPress={handleInvite}
                    />
                  </YStack>
                ) : null}

                {removeError ? <Paragraph color="$danger">{removeError}</Paragraph> : null}

                {isLoadingMembers ? (
                  <Spinner />
                ) : membersError ? (
                  <Paragraph color="$danger">{membersError}</Paragraph>
                ) : (
                  <MemberList
                    members={members}
                    isOwner={isOwner}
                    removingId={removingId}
                    onRemove={handleRemove}
                  />
                )}
              </YStack>

              <YStack gap="$3" borderTopWidth={1} borderColor="$border" paddingTop="$4">
                <Paragraph fontSize={18} fontWeight="700" color="$text">
                  Estados
                </Paragraph>

                {isOwner ? (
                  <YStack gap="$2">
                    <AppInput placeholder="Nombre del estado" value={newName} onChangeText={setNewName} />
                    {createError ? (
                      <Paragraph color="$danger" fontSize={13}>
                        {createError}
                      </Paragraph>
                    ) : null}
                    <AppButton
                      label="Agregar estado"
                      loading={isCreating}
                      disabled={!newName.trim() || isCreating}
                      onPress={handleCreateStatus}
                    />
                  </YStack>
                ) : null}

                {deleteStatusError ? <Paragraph color="$danger">{deleteStatusError}</Paragraph> : null}

                {isLoadingStatuses ? (
                  <Spinner />
                ) : statusesError ? (
                  <Paragraph color="$danger">{statusesError}</Paragraph>
                ) : (
                  <StatusList
                    statuses={statuses}
                    canManage={isOwner}
                    editingId={editingId}
                    editName={editName}
                    onEditNameChange={setEditName}
                    isSavingEdit={isSavingEdit}
                    editError={editError}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={handleSaveStatusEdit}
                    deletingId={deletingStatusId}
                    onDelete={handleDeleteStatus}
                  />
                )}
              </YStack>
            </>
          ) : null}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
