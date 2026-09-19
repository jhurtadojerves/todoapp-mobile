import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface SprintRepository {
  fetchSprints(boardId: number, page: number): Promise<PaginatedResponse<Sprint>>;
  createSprint(boardId: number, input: SprintInput): Promise<Sprint>;
  updateSprint(boardId: number, id: number, input: SprintInput): Promise<Sprint>;
  deleteSprint(boardId: number, id: number): Promise<void>;
}
