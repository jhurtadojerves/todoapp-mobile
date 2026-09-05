import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { BoardDataSource } from '@/data/datasources/board-datasource';
import { UserDataSource } from '@/data/datasources/user-datasource';
import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { CreateBoardUseCase } from '@/domain/usecases/create-board';
import { DeleteBoardUseCase } from '@/domain/usecases/delete-board';
import { GetBoardUseCase } from '@/domain/usecases/get-board';
import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { LoginUseCase } from '@/domain/usecases/login';
import { RefreshTokenUseCase } from '@/domain/usecases/refresh-token';
import { RegisterUseCase } from '@/domain/usecases/register';
import { UpdateBoardUseCase } from '@/domain/usecases/update-board';
import { ValidatePasswordUseCase } from '@/domain/usecases/validate-password';

const authDataSource = new AuthDataSource();
const userDataSource = new UserDataSource();
const boardDataSource = new BoardDataSource();
const authRepository = new AuthRepositoryImpl(authDataSource);
const userRepository = new UserRepositoryImpl(userDataSource);
const boardRepository = new BoardRepositoryImpl(boardDataSource);

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  refreshTokenUseCase: new RefreshTokenUseCase(authRepository),
  getUsersUseCase: new GetUsersUseCase(userRepository),
  registerUseCase: new RegisterUseCase(authRepository),
  validatePasswordUseCase: new ValidatePasswordUseCase(authRepository),
  getBoardsUseCase: new GetBoardsUseCase(boardRepository),
  getBoardUseCase: new GetBoardUseCase(boardRepository),
  createBoardUseCase: new CreateBoardUseCase(boardRepository),
  updateBoardUseCase: new UpdateBoardUseCase(boardRepository),
  deleteBoardUseCase: new DeleteBoardUseCase(boardRepository),
};
