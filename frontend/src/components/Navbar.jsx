import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

const Navbar = ({ notifications = [], onNotificationClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitle = routeTitles[location.pathname] || 'NexusBank';
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NB';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0 z-10">
      <h2 className="text-base font-semibold text-slate-900">{pageTitle}</h2>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 pl-9 pr-4 w-56 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        {/* Bell */}
        <button
          onClick={onNotificationClick}
          className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-lg transition"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-card-md py-1 z-20">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
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
