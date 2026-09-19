import { StatusRepository } from '@/domain/repositories/status-repository';

export class DeleteStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(boardId: number, id: number): Promise<void> {
    return this.statusRepository.deleteStatus(boardId, id);
  }
}
