import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class SprintRepositoryImpl implements SprintRepository {
  constructor(private readonly dataSource: SprintDataSource) {}

  fetchSprints(boardId: number, page: number): Promise<PaginatedResponse<Sprint>> {
    return this.dataSource.fetchSprints(boardId, page);
  }

  createSprint(boardId: number, input: SprintInput): Promise<Sprint> {
    return this.dataSource.createSprint(boardId, input);
  }

  updateSprint(boardId: number, id: number, input: SprintInput): Promise<Sprint> {
    return this.dataSource.updateSprint(boardId, id, input);
  }

  deleteSprint(boardId: number, id: number): Promise<void> {
    return this.dataSource.deleteSprint(boardId, id);
  }
}
