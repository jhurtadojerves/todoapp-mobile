import { DeleteTaskAttachmentUseCase } from '@/domain/usecases/delete-task-attachment';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';

const mockAttachmentRepository: jest.Mocked<AttachmentRepository> = {
  getByTask: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
};

describe('DeleteTaskAttachmentUseCase', () => {
  let useCase: DeleteTaskAttachmentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteTaskAttachmentUseCase(mockAttachmentRepository);
  });

  it('should call attachmentRepository.remove with the attachment id', async () => {
    mockAttachmentRepository.remove.mockResolvedValue(undefined);

    await useCase.execute('a1');

    expect(mockAttachmentRepository.remove).toHaveBeenCalledWith('a1');
  });

  it('should propagate errors thrown by the repository', async () => {
    mockAttachmentRepository.remove.mockRejectedValue(new Error('Delete failed'));

    await expect(useCase.execute('a1')).rejects.toThrow('Delete failed');
  });
});
