import { User } from '@/domain/models/user';
import { UserRepository } from '@/domain/repositories/user-repository';

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(token: string): Promise<User[]> {
    return this.userRepository.fetchUsers(token);
  }
}
