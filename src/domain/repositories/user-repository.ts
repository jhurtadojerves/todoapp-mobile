import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface UserRepository {
  fetchUsers(token: string, page: number): Promise<PaginatedResponse<User>>;
}
