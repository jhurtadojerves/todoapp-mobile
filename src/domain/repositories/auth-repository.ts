import { TokenPair, UserCredentials } from '@/domain/models/token';
import { PasswordValidationResult, RegisterCredentials, RegisteredUser } from '@/domain/models/register';

export interface AuthRepository {
  signIn(credentials: UserCredentials): Promise<TokenPair>;
  refreshToken(refresh: string): Promise<TokenPair>;
  register(credentials: RegisterCredentials): Promise<RegisteredUser>;
  validatePassword(password: string): Promise<PasswordValidationResult>;
}
