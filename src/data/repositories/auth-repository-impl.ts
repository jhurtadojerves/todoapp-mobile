import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { TokenPair, UserCredentials } from '@/domain/models/token';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly dataSource: AuthDataSource) {}

  signIn(credentials: UserCredentials): Promise<TokenPair> {
    return this.dataSource.requestToken(credentials);
  }

  refreshToken(refresh: string): Promise<TokenPair> {
    return this.dataSource.refreshToken(refresh);
  }
}
