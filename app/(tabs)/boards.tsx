import { useAuth } from '@/presentation/contexts/auth-context';
import { BoardsScreen } from '@/presentation/screens/boards-screen';
import { LoginScreen } from '@/presentation/screens/login-screen';

export default function BoardsTab() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <BoardsScreen />;
}
