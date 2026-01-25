import { TokenPair } from '@/domain/models/token';
import { AuthRepository } from '@/domain/repositories/auth-repository';

export class RefreshTokenUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  execute(refresh: string): Promise<TokenPair> {
    return this.authRepository.refreshToken(refresh);
  }
}
