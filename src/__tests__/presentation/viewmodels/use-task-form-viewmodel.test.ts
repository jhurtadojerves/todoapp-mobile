import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useTaskFormViewModel } from '@/presentation/viewmodels/use-task-form-viewmodel';
import {
  buildMembership,
  buildSprint,
  buildStatus,
  buildTask,
  paginated,
} from '@/test-utils/fixtures';

const mockGetStatuses = jest.fn();
const mockGetSprints = jest.fn();
const mockGetMembers = jest.fn();
const mockGetTask = jest.fn();
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();

jest.mock('@/shared/di/dependencies', () => ({
  dependencies: {
    getStatusesUseCase: { execute: (...args: unknown[]) => mockGetStatuses(...args) },
    getSprintsUseCase: { execute: (...args: unknown[]) => mockGetSprints(...args) },
    getMembersUseCase: { execute: (...args: unknown[]) => mockGetMembers(...args) },
    getTaskUseCase: { execute: (...args: unknown[]) => mockGetTask(...args) },
    createTaskUseCase: { execute: (...args: unknown[]) => mockCreateTask(...args) },
    updateTaskUseCase: { execute: (...args: unknown[]) => mockUpdateTask(...args) },
  },
}));

jest.mock('@/presentation/contexts/auth-context', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

const status = buildStatus();
const sprint = buildSprint();
const member = buildMembership();

async function renderLoaded(taskId?: number) {
  const hook = await renderHook(() => useTaskFormViewModel(1, taskId));
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useTaskFormViewModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStatuses.mockResolvedValue(paginated([status]));
    mockGetSprints.mockResolvedValue(paginated([sprint]));
    mockGetMembers.mockResolvedValue(paginated([member]));
  });

  it('should load the board options (statuses, sprints, members) for the pickers', async () => {
    const { result } = await renderLoaded();

    expect(mockGetStatuses).toHaveBeenCalledWith(1, 1);
    expect(mockGetSprints).toHaveBeenCalledWith(1, 1);
    expect(mockGetMembers).toHaveBeenCalledWith(1, 1);
    expect(result.current.statuses).toEqual([status]);
    expect(result.current.sprints).toEqual([sprint]);
    expect(result.current.members).toEqual([member]);
    expect(mockGetTask).not.toHaveBeenCalled();
  });

  it('should show an error when any of the options fails to load', async () => {
    mockGetSprints.mockRejectedValue(new Error('El servidor tuvo un problema.'));

    const { result } = await renderLoaded();

    expect(result.current.error).toBe('El servidor tuvo un problema.');
  });

  it('should not allow submitting while the title is blank', async () => {
    const { result } = await renderLoaded();

    expect(result.current.canSubmit).toBe(false);
    await act(async () => {
      await expect(result.current.submit()).rejects.toThrow('El título es obligatorio');
    });
    expect(result.current.titleError).toBe('El título es obligatorio');
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('should create the task with a trimmed title and the selected options', async () => {
    const created = buildTask({ title: 'Ship it' });
    mockCreateTask.mockResolvedValue(created);
    const { result } = await renderLoaded();
    await act(async () => {
      result.current.setTitle('  Ship it  ');
      result.current.setDescription('Before Friday');
      result.current.setStatusId(status.id);
      result.current.setSprintId(sprint.id);
      result.current.setAssignedToId(member.user.id);
    });

    let returned;
    await act(async () => {
      returned = await result.current.submit();
    });

    expect(mockCreateTask).toHaveBeenCalledWith(1, {
      title: 'Ship it',
      description: 'Before Friday',
      statusId: status.id,
      sprintId: sprint.id,
      assignedToId: member.user.id,
    });
    expect(returned).toEqual(created);
  });

  it('should expose and rethrow the API error when saving fails', async () => {
    mockCreateTask.mockRejectedValue(new Error('Estado inválido.'));
    const { result } = await renderLoaded();
    await act(async () => result.current.setTitle('Ship it'));

    await act(async () => {
      await expect(result.current.submit()).rejects.toThrow('Estado inválido.');
    });
    expect(result.current.error).toBe('Estado inválido.');
    expect(result.current.isSubmitting).toBe(false);
  });

  describe('editing', () => {
    const existing = buildTask({
      id: 10,
      title: 'Existing',
      description: 'Desc',
      status: { id: status.id, name: status.name, color: status.color },
      sprint: { id: sprint.id, name: sprint.name },
      assignedToId: member.user.id,
    });

    it('should prefill the form from the existing task', async () => {
      mockGetTask.mockResolvedValue(existing);

      const { result } = await renderLoaded(10);

      expect(mockGetTask).toHaveBeenCalledWith(10);
      expect(result.current.isEditing).toBe(true);
      expect(result.current.title).toBe('Existing');
      expect(result.current.description).toBe('Desc');
      expect(result.current.statusId).toBe(status.id);
      expect(result.current.sprintId).toBe(sprint.id);
      expect(result.current.assignedToId).toBe(member.user.id);
    });

    it('should update the task instead of creating a new one', async () => {
      mockGetTask.mockResolvedValue(existing);
      mockUpdateTask.mockResolvedValue(existing);
      const { result } = await renderLoaded(10);
      await act(async () => result.current.setStatusId(null));

      await act(() => result.current.submit());

      expect(mockUpdateTask).toHaveBeenCalledWith(10, expect.objectContaining({ statusId: null }));
      expect(mockCreateTask).not.toHaveBeenCalled();
    });
  });
});
