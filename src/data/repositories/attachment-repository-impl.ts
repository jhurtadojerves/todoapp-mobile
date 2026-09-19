import { AttachmentLocalDataSource } from '@/data/datasources/attachment-local-datasource';
import { TaskAttachment, TaskAttachmentInput } from '@/domain/models/attachment';
import { AttachmentRepository } from '@/domain/repositories/attachment-repository';

export class AttachmentRepositoryImpl implements AttachmentRepository {
  constructor(private readonly dataSource: AttachmentLocalDataSource) {}

  getByTask(taskId: number): Promise<TaskAttachment[]> {
    return this.dataSource.getByTask(taskId);
  }

  add(taskId: number, input: TaskAttachmentInput): Promise<TaskAttachment> {
    return this.dataSource.add(taskId, input);
  }

  remove(id: string): Promise<void> {
    return this.dataSource.remove(id);
  }
}
