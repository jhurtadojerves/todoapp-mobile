import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';

import { MemberList } from '@/presentation/components/members/member-list';
import { SprintList } from '@/presentation/components/sprints/sprint-list';
import { StatusList } from '@/presentation/components/statuses/status-list';
import { AppButton, AppInput } from '@/presentation/components/ui';
import { useBoardDetailViewModel } from '@/presentation/viewmodels/use-board-detail-viewmodel';
import { useBoardMembersViewModel } from '@/presentation/viewmodels/use-board-members-viewmodel';
import { useBoardSprintsViewModel } from '@/presentation/viewmodels/use-board-sprints-viewmodel';
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
  const {
    sprints,
    isLoading: isLoadingSprints,
    error: sprintsError,
    newName: newSprintName,
    setNewName: setNewSprintName,
    newStartDate: newSprintStartDate,
    setNewStartDate: setNewSprintStartDate,
    newEndDate: newSprintEndDate,
    setNewEndDate: setNewSprintEndDate,
    isCreating: isCreatingSprint,
    createError: createSprintError,
    createSprint,
    editingId: editingSprintId,
    editName: editSprintName,
    setEditName: setEditSprintName,
    editStartDate: editSprintStartDate,
    setEditStartDate: setEditSprintStartDate,
    editEndDate: editSprintEndDate,
    setEditEndDate: setEditSprintEndDate,
    startEdit: startEditSprint,
    cancelEdit: cancelEditSprint,
    isSavingEdit: isSavingSprintEdit,
    editError: editSprintError,
    saveEdit: saveSprintEdit,
    deletingId: deletingSprintId,
    deleteError: deleteSprintError,
    deleteSprint,
  } = useBoardSprintsViewModel(boardId);
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

  const handleCreateSprint = async () => {
    try {
      await createSprint();
    } catch {
    }
  };

  const handleSaveSprintEdit = async () => {
    try {
      await saveSprintEdit();
    } catch {
    }
  };

  const handleDeleteSprint = async (id: number) => {
    const confirmed = await confirmAction({
      title: 'Borrar sprint',
      message: '¿Seguro que querés borrar este sprint?',
      confirmLabel: 'Borrar',
    });
    if (!confirmed) return;

    deleteSprint(id).catch(() => {});
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

              <AppButton
                label="Ver tareas"
                onPress={() => router.push(`/board/${board.id}/tasks` as any)}
              />

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

              <YStack gap="$3" borderTopWidth={1} borderColor="$border" paddingTop="$4">
                <Paragraph fontSize={18} fontWeight="700" color="$text">
                  Sprints
                </Paragraph>

                {isOwner ? (
                  <YStack gap="$2">
                    <AppInput
                      placeholder="Nombre del sprint"
                      value={newSprintName}
                      onChangeText={setNewSprintName}
                    />
                    <XStack gap="$2">
                      <AppInput
                        flex={1}
                        placeholder="Inicio (AAAA-MM-DD)"
                        value={newSprintStartDate}
                        onChangeText={setNewSprintStartDate}
                      />
                      <AppInput
                        flex={1}
                        placeholder="Fin (AAAA-MM-DD)"
                        value={newSprintEndDate}
                        onChangeText={setNewSprintEndDate}
                      />
                    </XStack>
                    {createSprintError ? (
                      <Paragraph color="$danger" fontSize={13}>
                        {createSprintError}
                      </Paragraph>
                    ) : null}
                    <AppButton
                      label="Agregar sprint"
                      loading={isCreatingSprint}
                      disabled={!newSprintName.trim() || isCreatingSprint}
                      onPress={handleCreateSprint}
                    />
                  </YStack>
                ) : null}

                {deleteSprintError ? <Paragraph color="$danger">{deleteSprintError}</Paragraph> : null}

                {isLoadingSprints ? (
                  <Spinner />
                ) : sprintsError ? (
                  <Paragraph color="$danger">{sprintsError}</Paragraph>
                ) : (
                  <SprintList
                    sprints={sprints}
                    canManage={isOwner}
                    editingId={editingSprintId}
                    editName={editSprintName}
                    onEditNameChange={setEditSprintName}
                    editStartDate={editSprintStartDate}
                    onEditStartDateChange={setEditSprintStartDate}
                    editEndDate={editSprintEndDate}
                    onEditEndDateChange={setEditSprintEndDate}
                    isSavingEdit={isSavingSprintEdit}
                    editError={editSprintError}
                    onStartEdit={startEditSprint}
                    onCancelEdit={cancelEditSprint}
                    onSaveEdit={handleSaveSprintEdit}
                    deletingId={deletingSprintId}
                    onDelete={handleDeleteSprint}
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
