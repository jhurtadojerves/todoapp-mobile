import { TokenPair, UserCredentials } from '@/domain/models/token';

export interface AuthRepository {
  signIn(credentials: UserCredentials): Promise<TokenPair>;
  refreshToken(refresh: string): Promise<TokenPair>;
}
