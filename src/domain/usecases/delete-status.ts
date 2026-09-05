import { StatusRepository } from '@/domain/repositories/status-repository';

export class DeleteStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(token: string, boardId: number, id: number): Promise<void> {
    return this.statusRepository.deleteStatus(token, boardId, id);
  }
}
