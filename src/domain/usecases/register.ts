import { RegisterCredentials, RegisteredUser } from '@/domain/models/register';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class RegisterUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(credentials: RegisterCredentials): Promise<RegisteredUser> {
    return this.authRepository.register(credentials);
  }
}
