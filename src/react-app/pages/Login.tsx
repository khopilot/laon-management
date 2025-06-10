import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { login, isLoading, loginError, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    staff_id: '',
    password: ''
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {import.meta.env.VITE_APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Staff ID"
              name="staff_id"
              type="text"
              required
              value={formData.staff_id}
              onChange={handleChange}
              placeholder="Enter your staff ID"
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">
                {loginError instanceof Error ? loginError.message : 'Login failed. Please check your credentials.'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm font-medium mb-2">Demo Credentials:</p>
            <div className="text-blue-700 text-xs space-y-1">
              <p>Officer: staff_001 / password123</p>
              <p>Admin: admin_001 / admin123</p>
              <p className="text-blue-600 italic mt-2">
                Note: These will work once the backend authentication is implemented
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 