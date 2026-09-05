import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class BoardRepositoryImpl implements BoardRepository {
  constructor(private readonly dataSource: BoardDataSource) {}

  fetchBoards(token: string): Promise<Board[]> {
    return this.dataSource.fetchBoards(token);
  }

  fetchBoard(token: string, id: number): Promise<Board> {
    return this.dataSource.fetchBoard(token, id);
  }

  createBoard(token: string, input: BoardInput): Promise<Board> {
    return this.dataSource.createBoard(token, input);
  }

  updateBoard(token: string, id: number, input: BoardInput): Promise<Board> {
    return this.dataSource.updateBoard(token, id, input);
  }

  deleteBoard(token: string, id: number): Promise<void> {
    return this.dataSource.deleteBoard(token, id);
  }
}
