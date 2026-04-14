import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, CreditCard, ArrowLeftRight, FileText, Landmark } from 'lucide-react';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <aside className="sidebar glass">
        <div className="logo">
          <Landmark size={32} color="var(--accent)" />
          <span>Antigravity Bank</span>
        </div>
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <UserPlus size={20} />
            <span>Customers</span>
          </NavLink>
          <NavLink to="/accounts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <CreditCard size={20} />
            <span>Accounts</span>
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <ArrowLeftRight size={20} />
            <span>Financial Hub</span>
          </NavLink>
          <NavLink to="/statement" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={20} />
            <span>Statement</span>
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="top-bar glass">
          <h1>Banking Management System</h1>
          <div className="user-profile">
            <span>Admin Portal</span>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
