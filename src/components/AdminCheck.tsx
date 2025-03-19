
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

// List of admin emails
const ADMIN_EMAILS = [
  'admin@example.com',
  // Add your admin emails here
];

interface AdminCheckProps {
  children: React.ReactNode;
}

export const AdminCheck = ({ children }: AdminCheckProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full"></div>
    </div>;
  }

  // If user is not logged in or user email is not in admin list
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
