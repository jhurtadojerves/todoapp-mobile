import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';
import { UserRepository } from '@/domain/repositories/user-repository';

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly dataSource: UserDataSource) {}

  fetchUsers(token: string): Promise<User[]> {
    return this.dataSource.fetchUsers(token);
  }
}
