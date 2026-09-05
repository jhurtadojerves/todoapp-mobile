import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { UserDataSource } from '@/data/datasources/user-datasource';
import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { LoginUseCase } from '@/domain/usecases/login';
import { RefreshTokenUseCase } from '@/domain/usecases/refresh-token';
import { RegisterUseCase } from '@/domain/usecases/register';
import { ValidatePasswordUseCase } from '@/domain/usecases/validate-password';

const authDataSource = new AuthDataSource();
const userDataSource = new UserDataSource();
const authRepository = new AuthRepositoryImpl(authDataSource);
const userRepository = new UserRepositoryImpl(userDataSource);

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  refreshTokenUseCase: new RefreshTokenUseCase(authRepository),
  getUsersUseCase: new GetUsersUseCase(userRepository),
  registerUseCase: new RegisterUseCase(authRepository),
  validatePasswordUseCase: new ValidatePasswordUseCase(authRepository),
};
