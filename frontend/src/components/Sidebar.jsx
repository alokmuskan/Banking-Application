import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, PiggyBank, TrendingUp,
  FileText, Headset, LogOut, Shield, ChevronLeft, ChevronRight,
  Users, Landmark, CheckSquare, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const navSections = [
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

const roleColors = {
  admin:    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  teller:   'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  customer: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const userRole = user?.role || 'customer';
  const initials = user?.email?.slice(0, 2).toUpperCase() || 'NB';

  const navContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center h-14 border-b border-slate-200 dark:border-slate-700 px-4 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-primary-600" />
            <span className="font-semibold text-primary-900 dark:text-white text-base">NexusBank</span>
          </div>
        )}
        {collapsed && <Shield size={20} className="text-primary-600" />}

        {/* Desktop collapse toggle */}
        <button onClick={onToggleCollapse}
          className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 transition">
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      {/* Nav links */}
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
                <NavLink key={to} to={to} end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 mx-2 px-2 py-2 rounded-lg text-sm transition-colors duration-100 group relative
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium border-l-2 border-blue-600 rounded-l-none'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}`
                  }>
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
      <div className={`border-t border-slate-200 dark:border-slate-700 p-3 flex-shrink-0 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.email?.split('@')[0]}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleColors[userRole]}`}>{userRole}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-700">{initials}</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition">
              <LogOut size={14} />
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP sidebar */}
      <aside className={`hidden lg:flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-200 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}>
        {navContent}
      </aside>

      {/* MOBILE sidebar: overlay drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl lg:hidden animate-fade-in">
            {navContent}
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
