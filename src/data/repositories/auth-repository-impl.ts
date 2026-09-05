import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { TokenPair, UserCredentials } from '@/domain/models/token';
import { PasswordValidationResult, RegisterCredentials, RegisteredUser } from '@/domain/models/register';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly dataSource: AuthDataSource) {}

  signIn(credentials: UserCredentials): Promise<TokenPair> {
    return this.dataSource.requestToken(credentials);
  }

  refreshToken(refresh: string): Promise<TokenPair> {
    return this.dataSource.refreshToken(refresh);
  }

  register(credentials: RegisterCredentials): Promise<RegisteredUser> {
    return this.dataSource.register(credentials);
  }

  validatePassword(password: string): Promise<PasswordValidationResult> {
    return this.dataSource.validatePassword(password);
  }
}
