import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Clients', href: '/clients' },
  { name: 'Loan Applications', href: '/loan-applications' },
  { name: 'Loans', href: '/loans' },
  { name: 'Payments', href: '/payments' },
  { name: 'Reports', href: '/reports' },
  { name: 'Admin', href: '/admin', adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.staff_role === 'admin'
  );

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};