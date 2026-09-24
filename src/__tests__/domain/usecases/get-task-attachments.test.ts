import { GetTaskAttachmentsUseCase } from '@/domain/usecases/get-task-attachments';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';
import { TaskAttachment } from '@/domain/models/attachment';

const mockAttachmentRepository: jest.Mocked<AttachmentRepository> = {
  getByTask: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
};

const attachment: TaskAttachment = {
  id: 'a1',
  taskId: 10,
  photoUri: 'file:///documents/task-attachments/a1.jpg',
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('GetTaskAttachmentsUseCase', () => {
  let useCase: GetTaskAttachmentsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTaskAttachmentsUseCase(mockAttachmentRepository);
  });

  it('should call attachmentRepository.getByTask with the task id', async () => {
    mockAttachmentRepository.getByTask.mockResolvedValue([]);

    await useCase.execute(10);

    expect(mockAttachmentRepository.getByTask).toHaveBeenCalledWith(10);
  });

  it('should return the attachments from the repository', async () => {
    mockAttachmentRepository.getByTask.mockResolvedValue([attachment]);

    const result = await useCase.execute(10);

    expect(result).toEqual([attachment]);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockAttachmentRepository.getByTask.mockRejectedValue(new Error('Read failed'));

    await expect(useCase.execute(10)).rejects.toThrow('Read failed');
  });
});
