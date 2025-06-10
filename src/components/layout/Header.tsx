import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                {import.meta.env.VITE_APP_NAME}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-700">
                  Welcome, {user.staff_role === 'admin' ? 'Admin' : 'Officer'}
                </div>
                <div className="text-sm text-gray-500">
                  {user.branch_name || 'Branch'}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 