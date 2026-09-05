import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { BoardDataSource } from '@/data/datasources/board-datasource';
import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { StatusDataSource } from '@/data/datasources/status-datasource';
import { UserDataSource } from '@/data/datasources/user-datasource';
import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { MembershipRepositoryImpl } from '@/data/repositories/membership-repository-impl';
import { SprintRepositoryImpl } from '@/data/repositories/sprint-repository-impl';
import { StatusRepositoryImpl } from '@/data/repositories/status-repository-impl';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { AddMemberUseCase } from '@/domain/usecases/add-member';
import { CreateBoardUseCase } from '@/domain/usecases/create-board';
import { CreateSprintUseCase } from '@/domain/usecases/create-sprint';
import { CreateStatusUseCase } from '@/domain/usecases/create-status';
import { DeleteBoardUseCase } from '@/domain/usecases/delete-board';
import { DeleteSprintUseCase } from '@/domain/usecases/delete-sprint';
import { DeleteStatusUseCase } from '@/domain/usecases/delete-status';
import { GetBoardUseCase } from '@/domain/usecases/get-board';
import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { GetMembersUseCase } from '@/domain/usecases/get-members';
import { GetSprintsUseCase } from '@/domain/usecases/get-sprints';
import { GetStatusesUseCase } from '@/domain/usecases/get-statuses';
import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { LoginUseCase } from '@/domain/usecases/login';
import { RefreshTokenUseCase } from '@/domain/usecases/refresh-token';
import { RegisterUseCase } from '@/domain/usecases/register';
import { RemoveMemberUseCase } from '@/domain/usecases/remove-member';
import { UpdateBoardUseCase } from '@/domain/usecases/update-board';
import { UpdateSprintUseCase } from '@/domain/usecases/update-sprint';
import { UpdateStatusUseCase } from '@/domain/usecases/update-status';
import { ValidatePasswordUseCase } from '@/domain/usecases/validate-password';

const authDataSource = new AuthDataSource();
const userDataSource = new UserDataSource();
const boardDataSource = new BoardDataSource();
const membershipDataSource = new MembershipDataSource();
const statusDataSource = new StatusDataSource();
const sprintDataSource = new SprintDataSource();
const authRepository = new AuthRepositoryImpl(authDataSource);
const userRepository = new UserRepositoryImpl(userDataSource);
const boardRepository = new BoardRepositoryImpl(boardDataSource);
const membershipRepository = new MembershipRepositoryImpl(membershipDataSource);
const statusRepository = new StatusRepositoryImpl(statusDataSource);
const sprintRepository = new SprintRepositoryImpl(sprintDataSource);

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
  getMembersUseCase: new GetMembersUseCase(membershipRepository),
  addMemberUseCase: new AddMemberUseCase(membershipRepository),
  removeMemberUseCase: new RemoveMemberUseCase(membershipRepository),
  getStatusesUseCase: new GetStatusesUseCase(statusRepository),
  createStatusUseCase: new CreateStatusUseCase(statusRepository),
  updateStatusUseCase: new UpdateStatusUseCase(statusRepository),
  deleteStatusUseCase: new DeleteStatusUseCase(statusRepository),
  getSprintsUseCase: new GetSprintsUseCase(sprintRepository),
  createSprintUseCase: new CreateSprintUseCase(sprintRepository),
  updateSprintUseCase: new UpdateSprintUseCase(sprintRepository),
  deleteSprintUseCase: new DeleteSprintUseCase(sprintRepository),
};
