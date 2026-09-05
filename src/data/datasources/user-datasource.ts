import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

export class UserDataSource {
  fetchUsers(token: string, page: number): Promise<PaginatedResponse<User>> {
    return apiFetch<PaginatedResponse<User>>(`/api/v1/users/${buildQueryString({ page })}`, { token });
  }
}
