import { TaskAttachment, TaskAttachmentInput } from '@/domain/models/attachment';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';

export class AddTaskAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  execute(taskId: number, input: TaskAttachmentInput): Promise<TaskAttachment> {
    return this.attachmentRepository.add(taskId, input);
  }
}
