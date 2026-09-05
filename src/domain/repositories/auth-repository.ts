import { TokenPair, UserCredentials } from '@/domain/models/token';
import { PasswordValidationResult, RegisterCredentials } from '@/domain/models/register';

export interface AuthRepository {
  signIn(credentials: UserCredentials): Promise<TokenPair>;
  refreshToken(refresh: string): Promise<TokenPair>;
  register(credentials: RegisterCredentials): Promise<TokenPair>;
  validatePassword(password: string): Promise<PasswordValidationResult>;
}
