import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  HomeIcon,
  UsersIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Loan Applications', href: '/applications', icon: DocumentCheckIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Active Loans', href: '/loans', icon: BanknotesIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Administration', href: '/admin', icon: CogIcon, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.staff_role === 'admin'
  );

  return (
    <div className="flex flex-col w-64 bg-gray-900 shadow-xl">
      {/* Logo/Brand Section */}
      <div className="flex items-center h-16 px-4 bg-gray-800">
        <BuildingOfficeIcon className="h-8 w-8 text-blue-400 mr-3" />
        <div>
          <h1 className="text-white font-bold text-lg">LoanCare</h1>
          <p className="text-gray-400 text-xs">Management System</p>
        </div>
      </div>

      {/* User Info Section */}
      {user && (
        <div className="flex items-center px-4 py-4 bg-gray-800 border-b border-gray-700">
          <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.staff_role === 'admin' ? 'Administrator' : 'Loan Officer'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user.branch_id || 'BR001'}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-2 flex-1 px-3 space-y-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:transform hover:scale-105'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'mr-3 h-6 w-6 transition-colors duration-200',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-8 bg-blue-300 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="px-3 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            <p>Version 1.0.0</p>
            <p className="mt-1">© 2025 LoanCare</p>
          </div>
        </div>
      </div>
    </div>
  );
};