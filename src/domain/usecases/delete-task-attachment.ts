import { AttachmentRepository } from '@/domain/repositories/attachment-repository';

export class DeleteTaskAttachmentUseCase {
  constructor(private readonly attachmentRepository: AttachmentRepository) {}

  execute(id: string): Promise<void> {
    return this.attachmentRepository.remove(id);
  }
}
