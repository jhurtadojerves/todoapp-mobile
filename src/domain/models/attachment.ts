export interface TaskAttachment {
  id: string;
  taskId: number;
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface TaskAttachmentInput {
  photoUri: string;
  latitude: number | null;
  longitude: number | null;
}
