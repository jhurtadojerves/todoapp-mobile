import { PasswordValidationResult } from '@/domain/models/register';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class ValidatePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(password: string): Promise<PasswordValidationResult> {
    return this.authRepository.validatePassword(password);
  }
}
