import { TaskAttachment } from '@/domain/models/attachment';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';

export class GetTaskAttachmentsUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  execute(taskId: number): Promise<TaskAttachment[]> {
    return this.attachmentRepository.getByTask(taskId);
  }
}
