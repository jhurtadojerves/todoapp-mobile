import { useRouter } from 'expo-router';
import { Paragraph, ScrollView, Spinner, YStack } from 'tamagui';

import { AppButton, AppInput, AppTitle, ChipPicker } from '@/presentation/components/ui';
import { useTaskFormViewModel } from '@/presentation/viewmodels/use-task-form-viewmodel';

type Props = {
  boardId: number;
  taskId?: number;
};

export function TaskFormScreen({ boardId, taskId }: Props) {
  const router = useRouter();
  const {
    title,
    setTitle,
    description,
    setDescription,
    statusId,
    setStatusId,
    sprintId,
    setSprintId,
    assignedToId,
    setAssignedToId,
    statuses,
    sprints,
    members,
    isEditing,
    isLoading,
    isSubmitting,
    error,
    titleError,
    canSubmit,
    submit,
  } = useTaskFormViewModel(boardId, taskId);

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
          maxWidth={480}
          borderColor="$border"
          borderWidth={1}
          borderRadius="$3"
          backgroundColor="$backgroundSoft"
          padding="$5"
          gap="$3"
        >
          <AppTitle subtitle={isEditing ? 'Actualizá los datos de la tarea.' : 'Agregá una nueva tarea al tablero.'}>
            {isEditing ? 'Editar tarea' : 'Nueva tarea'}
          </AppTitle>

          <YStack gap="$2">
            <AppInput placeholder="Título" value={title} onChangeText={setTitle} />
            {titleError ? (
              <Paragraph color="$danger" fontSize={13}>
                {titleError}
              </Paragraph>
            ) : null}
          </YStack>

          <YStack gap="$2">
            <AppInput
              placeholder="Descripción"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              height={100}
              textAlignVertical="top"
              paddingTop="$3"
            />
          </YStack>

          <ChipPicker
            label="Estado"
            options={[{ id: null, label: 'Sin estado' }, ...statuses.map((s) => ({ id: s.id, label: s.name }))]}
            selectedId={statusId}
            onSelect={setStatusId}
          />

          <ChipPicker
            label="Sprint"
            options={[{ id: null, label: 'Sin sprint' }, ...sprints.map((s) => ({ id: s.id, label: s.name }))]}
            selectedId={sprintId}
            onSelect={setSprintId}
          />

          <ChipPicker
            label="Asignado a"
            options={[
              { id: null, label: 'Sin asignar' },
              ...members.map((m) => ({ id: m.user.id, label: m.user.username })),
            ]}
            selectedId={assignedToId}
            onSelect={setAssignedToId}
          />

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
            label={isEditing ? 'Guardar cambios' : 'Crear tarea'}
          />

          <AppButton variant="outlined" onPress={() => router.back()} label="Cancelar" />
        </YStack>
      </YStack>
    </ScrollView>
  );
}
