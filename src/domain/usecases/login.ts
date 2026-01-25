import { TokenPair, UserCredentials } from '@/domain/models/token';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: UserCredentials): Promise<TokenPair> {
    return this.authRepository.signIn(credentials);
  }
}
