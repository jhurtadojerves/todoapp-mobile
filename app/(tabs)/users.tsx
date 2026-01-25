import { useAuth } from '@/presentation/contexts/auth-context';
import { LoginScreen } from '@/presentation/screens/login-screen';
import { UsersScreen } from '@/presentation/screens/users-screen';

export default function UsersTab() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <UsersScreen />;
}
