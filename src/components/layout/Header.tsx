import { useState } from 'react';
import { 
  BellIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Breadcrumb/Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                Loan Management System
              </h1>
            </div>
          </div>
          
          {/* Right Section - Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className="hidden md:block text-sm text-gray-500">
              {currentTime}
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 transform translate-x-1 -translate-y-1"></span>
            </button>

            {user && (
              <div className="relative">
                {/* User Menu Button */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.staff_role === 'admin' ? 'Administrator' : 'Loan Officer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.branch_id || 'BR001'}
                    </p>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.staff_role === 'admin' ? 'Administrator' : 'Loan Officer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Branch: {user.branch_id || 'BR001'}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <CogIcon className="h-4 w-4 mr-3 text-gray-400" />
                        Settings
                      </button>

                      <button 
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlay to close menu */}
                {showUserMenu && (
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 