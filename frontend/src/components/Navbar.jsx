import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronDown, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const routeTitles = {
  '/':            'Dashboard',
  '/dashboard':   'Dashboard',
  '/customers':   'Customer Management',
  '/accounts':    'Account Management',
  '/approvals':   'Approvals',
  '/transactions':'Financial Hub',
  '/cards':       'Virtual Cards',
  '/loans':       'Loans Center',
  '/fd':          'Fixed Deposits',
  '/statement':   'Account Statement',
  '/support':     'Support Center',
};

const Navbar = ({ notifications = [], onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitle = routeTitles[location.pathname] || 'NexusBank';
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NB';

  return (
    <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Search — hidden on small screens */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 pl-9 pr-4 w-48 lg:w-56 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>

        {/* Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card-md py-1 z-20">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
