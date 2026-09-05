import { RegisterCredentials } from '@/domain/models/register';
import { TokenPair } from '@/domain/models/token';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: RegisterCredentials): Promise<TokenPair> {
    return this.authRepository.register(credentials);
  }
}
