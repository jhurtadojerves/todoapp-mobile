import * as FileSystem from 'expo-file-system/legacy';

import { TaskAttachment, TaskAttachmentInput } from '@/domain/models/attachment';

const ATTACHMENTS_DIR = `${FileSystem.documentDirectory}task-attachments/`;
const INDEX_PATH = `${ATTACHMENTS_DIR}index.json`;

/**
 * Persists task attachments (photo + GPS coordinates) entirely on-device, since the
 * backend task API has no field for them.
 */
export class AttachmentLocalDataSource {
  private async ensureDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(ATTACHMENTS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(ATTACHMENTS_DIR, { intermediates: true });
    }
  }

  private async readIndex(): Promise<TaskAttachment[]> {
    await this.ensureDir();
    const info = await FileSystem.getInfoAsync(INDEX_PATH);
    if (!info.exists) return [];

    try {
      const raw = await FileSystem.readAsStringAsync(INDEX_PATH);
      return JSON.parse(raw) as TaskAttachment[];
    } catch {
      return [];
    }
  }

  private async writeIndex(records: TaskAttachment[]): Promise<void> {
    await this.ensureDir();
    await FileSystem.writeAsStringAsync(INDEX_PATH, JSON.stringify(records));
  }

  async getByTask(taskId: number): Promise<TaskAttachment[]> {
    const records = await this.readIndex();
    return records
      .filter((record) => record.taskId === taskId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async add(taskId: number, input: TaskAttachmentInput): Promise<TaskAttachment> {
    await this.ensureDir();

    const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const extensionMatch = /\.(\w+)$/.exec(input.photoUri);
    const extension = extensionMatch ? extensionMatch[1] : 'jpg';
    const destination = `${ATTACHMENTS_DIR}${id}.${extension}`;
    await FileSystem.copyAsync({ from: input.photoUri, to: destination });

    const record: TaskAttachment = {
      id,
      taskId,
      photoUri: destination,
      latitude: input.latitude,
      longitude: input.longitude,
      createdAt: new Date().toISOString(),
    };

    const records = await this.readIndex();
    records.push(record);
    await this.writeIndex(records);

    return record;
  }

  async remove(id: string): Promise<void> {
    const records = await this.readIndex();
    const record = records.find((r) => r.id === id);
    if (!record) return;

    await this.writeIndex(records.filter((r) => r.id !== id));

    const info = await FileSystem.getInfoAsync(record.photoUri);
    if (info.exists) {
      await FileSystem.deleteAsync(record.photoUri, { idempotent: true });
    }
  }
}
