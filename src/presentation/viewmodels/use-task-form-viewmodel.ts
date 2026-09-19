import { BoardMembership } from '@/domain/models/membership';
import { Sprint } from '@/domain/models/sprint';
import { BoardStatus } from '@/domain/models/status';
import { Task, TaskInput } from '@/domain/models/task';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useEffect, useState } from 'react';

export function useTaskFormViewModel(boardId: number, taskId?: number) {
  const { isAuthenticated } = useAuth();
  const isEditing = taskId !== undefined;

  const [title, setTitleValue] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<number | null>(null);
  const [sprintId, setSprintId] = useState<number | null>(null);
  const [assignedToId, setAssignedToId] = useState<number | null>(null);

  const [statuses, setStatuses] = useState<BoardStatus[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [members, setMembers] = useState<BoardMembership[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadOptions = Promise.all([
      dependencies.getStatusesUseCase.execute(boardId, 1),
      dependencies.getSprintsUseCase.execute(boardId, 1),
      dependencies.getMembersUseCase.execute(boardId, 1),
    ]);
    const loadTask: Promise<Task | null> = isEditing
      ? dependencies.getTaskUseCase.execute(taskId)
      : Promise.resolve(null);

    Promise.all([loadOptions, loadTask])
      .then(([[statusesResult, sprintsResult, membersResult], task]) => {
        if (!isMounted) return;
        setStatuses(statusesResult.results);
        setSprints(sprintsResult.results);
        setMembers(membersResult.results);
        if (task) {
          setTitleValue(task.title);
          setDescription(task.description);
          setStatusId(task.status?.id ?? null);
          setSprintId(task.sprint?.id ?? null);
          setAssignedToId(task.assignedToId);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, boardId, taskId, isEditing]);

  const setTitle = (value: string) => {
    setTitleValue(value);
    if (value.trim()) {
      setTitleError(null);
    }
  };

  const submit = async (): Promise<Task> => {
    setError(null);

    if (!title.trim()) {
      setTitleError('El título es obligatorio');
      throw new Error('El título es obligatorio');
    }

    if (!isAuthenticated) {
      throw new Error('No hay una sesión activa.');
    }

    const input: TaskInput = {
      title: title.trim(),
      description,
      statusId,
      sprintId,
      assignedToId,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        return await dependencies.updateTaskUseCase.execute(taskId, input);
      }
      return await dependencies.createTaskUseCase.execute(boardId, input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la tarea.';
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(title.trim()) && !isSubmitting && !isLoading;

  return {
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
  };
}
