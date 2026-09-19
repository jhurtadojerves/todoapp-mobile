import { User, userSchema } from '@/domain/models/user';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const paginatedUserSchema = paginatedSchema(userSchema);

export class UserDataSource {
  fetchUsers(page: number): Promise<PaginatedResponse<User>> {
    return apiFetch(`/api/v1/users/${buildQueryString({ page })}`, {
      schema: paginatedUserSchema,
    });
  }
}
