import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';
import { UserRepository } from '@/domain/repositories/user-repository';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly dataSource: UserDataSource) {}

  fetchUsers(page: number): Promise<PaginatedResponse<User>> {
    return this.dataSource.fetchUsers(page);
  }
}
