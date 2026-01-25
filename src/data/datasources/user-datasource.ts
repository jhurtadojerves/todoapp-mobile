import { User } from '@/domain/models/user';
import { API_BASE_URL } from '@/shared/config/api';

const USERS_ENDPOINT = `${API_BASE_URL}/api/v1/users/`;

export class UserDataSource {
  async fetchUsers(token: string): Promise<User[]> {
    const response = await fetch(USERS_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudieron cargar los usuarios.');
    }

    return response.json();
  }
}
