import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, CreditCard, FileText, Headset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Bottom tab bar for mobile screens (< lg)
const mobileNav = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Pay' },
  { to: '/cards', icon: CreditCard, label: 'Cards' },
  { to: '/statement', icon: FileText, label: 'Statement' },
  { to: '/support', icon: Headset, label: 'Support' },
];

const MobileBottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 h-14 px-2"
    >
      {mobileNav.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 min-w-0 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`
          }
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
