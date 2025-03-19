
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
