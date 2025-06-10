import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BuildingOfficeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
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

  const handleDemoLogin = async (role: 'admin' | 'officer') => {
    const demoCredentials = {
      staff_id: role === 'admin' ? 'admin_001' : 'staff_001',
      password: role === 'admin' ? 'admin123' : 'password123'
    };
    
    try {
      await login(demoCredentials);
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <BuildingOfficeIcon className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            LoanCare Management
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Staff ID"
                name="staff_id"
                type="text"
                required
                value={formData.staff_id}
                onChange={handleChange}
                placeholder="Enter your staff ID"
              />
            </div>

            <div>
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
              variant="primary"
              className="w-full"
              loading={isLoading}
            >
              <LockClosedIcon className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Quick Demo Access
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('admin')}
                loading={isLoading}
                className="w-full"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Admin Demo
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoLogin('officer')}
                loading={isLoading}
                className="w-full"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Officer Demo
              </Button>
            </div>
          </div>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm font-medium mb-2">Demo Credentials:</p>
            <div className="text-blue-700 text-xs space-y-1">
              <p><strong>Officer:</strong> staff_001 / password123</p>
              <p><strong>Admin:</strong> admin_001 / admin123</p>
              <p className="text-blue-600 italic mt-2">
                Use the demo buttons above for quick access
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-100">
            Loan Management System v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}; 