import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class SprintRepositoryImpl implements SprintRepository {
  constructor(private readonly dataSource: SprintDataSource) {}

  fetchSprints(token: string, boardId: number, page: number): Promise<PaginatedResponse<Sprint>> {
    return this.dataSource.fetchSprints(token, boardId, page);
  }

  createSprint(token: string, boardId: number, input: SprintInput): Promise<Sprint> {
    return this.dataSource.createSprint(token, boardId, input);
  }

  updateSprint(token: string, boardId: number, id: number, input: SprintInput): Promise<Sprint> {
    return this.dataSource.updateSprint(token, boardId, id, input);
  }

  deleteSprint(token: string, boardId: number, id: number): Promise<void> {
    return this.dataSource.deleteSprint(token, boardId, id);
  }
}
