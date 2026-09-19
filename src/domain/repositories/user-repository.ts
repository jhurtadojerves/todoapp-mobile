import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface UserRepository {
  fetchUsers(page: number): Promise<PaginatedResponse<User>>;
}
