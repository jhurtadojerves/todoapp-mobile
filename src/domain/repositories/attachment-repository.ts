import { TaskAttachment, TaskAttachmentInput } from '@/domain/models/attachment';

export interface AttachmentRepository {
  getByTask(taskId: number): Promise<TaskAttachment[]>;
  add(taskId: number, input: TaskAttachmentInput): Promise<TaskAttachment>;
  remove(id: string): Promise<void>;
}
