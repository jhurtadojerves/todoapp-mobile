import { User } from '@/domain/models/user';
import { apiFetch } from '@/shared/api/http-client';

export class UserDataSource {
  fetchUsers(token: string): Promise<User[]> {
    return apiFetch<User[]>('/api/v1/users/', { token });
  }
}
