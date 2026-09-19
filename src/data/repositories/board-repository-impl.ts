import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class BoardRepositoryImpl implements BoardRepository {
  constructor(private readonly dataSource: BoardDataSource) {}

  fetchBoards(page: number): Promise<PaginatedResponse<Board>> {
    return this.dataSource.fetchBoards(page);
  }

  fetchBoard(id: number): Promise<Board> {
    return this.dataSource.fetchBoard(id);
  }

  createBoard(input: BoardInput): Promise<Board> {
    return this.dataSource.createBoard(input);
  }

  updateBoard(id: number, input: BoardInput): Promise<Board> {
    return this.dataSource.updateBoard(id, input);
  }

  deleteBoard(id: number): Promise<void> {
    return this.dataSource.deleteBoard(id);
  }
}
