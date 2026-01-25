import { User } from '@/domain/models/user';

export interface UserRepository {
  fetchUsers(token: string): Promise<User[]>;
}
