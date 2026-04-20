import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, PiggyBank, TrendingUp,
  FileText, Headset, LogOut, Shield, ChevronLeft, ChevronRight,
  Users, Landmark, CheckSquare, Wallet, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['customer', 'admin', 'teller'] },
      { to: '/transactions', icon: ArrowLeftRight, label: 'Financial Hub', roles: ['customer', 'admin', 'teller'] },
      { to: '/statement', icon: FileText, label: 'Statements', roles: ['customer', 'admin', 'teller'] },
      { to: '/support', icon: Headset, label: 'Support', roles: ['customer', 'admin', 'teller'] },
    ],
  },
  {
    label: 'Products',
    items: [
      { to: '/cards', icon: CreditCard, label: 'Virtual Cards', roles: ['customer', 'admin', 'teller'] },
      { to: '/loans', icon: PiggyBank, label: 'Loans Center', roles: ['customer', 'admin', 'teller'] },
      { to: '/fd', icon: TrendingUp, label: 'Fixed Deposits', roles: ['customer', 'admin', 'teller'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'teller'] },
      { to: '/accounts', icon: Landmark, label: 'Accounts', roles: ['admin', 'teller'] },
      { to: '/approvals', icon: CheckSquare, label: 'Approvals', roles: ['admin', 'teller'] },
    ],
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    admin:    'bg-purple-100 text-purple-700',
    teller:   'bg-amber-100 text-amber-700',
    customer: 'bg-blue-100 text-blue-700',
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NB';
  const userRole = user?.role || 'customer';

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-slate-100 px-4 relative flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary-600" />
            <span className="font-semibold text-primary-900 text-base">NexusBank</span>
          </div>
        )}
        {collapsed && <Shield size={20} className="text-primary-600" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition ${collapsed ? 'mt-0' : ''}`}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navSections.map(section => {
          const visibleItems = section.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label} className="mb-4">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-1">{section.label}</p>
              )}
              {visibleItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 mx-2 px-2 py-2 rounded-lg text-sm transition-colors duration-100 group relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`border-t border-slate-100 p-3 flex-shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleColors[userRole]}`}>
                {userRole}
              </span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
