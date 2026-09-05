import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';
import { UserRepository } from '@/domain/repositories/user-repository';

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(token: string, page: number): Promise<PaginatedResponse<User>> {
    return this.userRepository.fetchUsers(token, page);
  }
}
