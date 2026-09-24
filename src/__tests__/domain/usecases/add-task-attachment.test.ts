import { AddTaskAttachmentUseCase } from '@/domain/usecases/add-task-attachment';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';
import { TaskAttachment, TaskAttachmentInput } from '@/domain/models/attachment';

const mockAttachmentRepository: jest.Mocked<AttachmentRepository> = {
  getByTask: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
};

const input: TaskAttachmentInput = {
  photoUri: 'file:///cache/photo.jpg',
  latitude: -0.18,
  longitude: -78.47,
};

const attachment: TaskAttachment = {
  id: 'a1',
  taskId: 10,
  photoUri: 'file:///documents/task-attachments/a1.jpg',
  latitude: -0.18,
  longitude: -78.47,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('AddTaskAttachmentUseCase', () => {
  let useCase: AddTaskAttachmentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AddTaskAttachmentUseCase(mockAttachmentRepository);
  });

  it('should call attachmentRepository.add with the task id and input', async () => {
    mockAttachmentRepository.add.mockResolvedValue(attachment);

    await useCase.execute(10, input);

    expect(mockAttachmentRepository.add).toHaveBeenCalledWith(10, input);
  });

  it('should return the stored attachment from the repository', async () => {
    mockAttachmentRepository.add.mockResolvedValue(attachment);

    const result = await useCase.execute(10, input);

    expect(result).toEqual(attachment);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockAttachmentRepository.add.mockRejectedValue(new Error('Disk full'));

    await expect(useCase.execute(10, input)).rejects.toThrow('Disk full');
  });
});
