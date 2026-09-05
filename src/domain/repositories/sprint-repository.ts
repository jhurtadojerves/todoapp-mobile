import { Sprint, SprintInput } from '@/domain/models/sprint';

export interface SprintRepository {
  fetchSprints(token: string, boardId: number): Promise<Sprint[]>;
  createSprint(token: string, boardId: number, input: SprintInput): Promise<Sprint>;
  updateSprint(token: string, boardId: number, id: number, input: SprintInput): Promise<Sprint>;
  deleteSprint(token: string, boardId: number, id: number): Promise<void>;
}
