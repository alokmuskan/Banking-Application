import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, UserPlus, CreditCard, ArrowLeftRight, FileText, Landmark, LogOut, Wallet, PiggyBank, Bell, Headset, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
     // Fetch notifications when path changes to simulate real-time updates when navigating
     const fetchNotifications = async () => {
         if (user?.customerId) {
             try {
                 const resp = await axios.get(`http://localhost:5000/api/support/notifications/${user.customerId}`);
                 setNotifications(resp.data);
             } catch (err) { console.error('Failed fetching notifs', err); }
         }
     };
     fetchNotifications();
  }, [user, location.pathname]);

  const markAsRead = async (id) => {
      try {
          await axios.put(`http://localhost:5000/api/support/notifications/${id}/read`);
          setNotifications(notifications.map(n => n.id === id ? {...n, is_read: 1} : n));
      } catch (err) {}
  };

  const markAllAsRead = async () => {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
          await markAsRead(n.id);
      }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="app-container">
      <aside className="sidebar glass">
        <div className="logo">
          <Landmark size={32} color="var(--accent)" />
          <span>Bank App</span>
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
          <NavLink to="/cards" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Wallet size={20} />
            <span>Virtual Cards</span>
          </NavLink>
          <NavLink to="/loans" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <PiggyBank size={20} />
            <span>Loans Center</span>
          </NavLink>
          <NavLink to="/statement" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <FileText size={20} />
            <span>Statement</span>
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <Headset size={20} />
            <span>Support</span>
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <header className="top-bar glass">
          <h1>Banking Management System</h1>
          <div className="user-profile">
            
            {user?.role === 'customer' && (
                <div className="notification-wrapper">
                    <button className="bell-btn" onClick={() => setShowDropdown(!showDropdown)}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                    </button>

                    {showDropdown && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button className="mark-all-read" onClick={markAllAsRead}>
                                        <CheckCheck size={14} style={{marginRight: '4px'}}/> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="notif-body">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div key={notif.id} className={`notif-item ${!notif.is_read ? 'unread' : ''}`} onClick={() => markAsRead(notif.id)}>
                                        <div className="notif-title">{notif.title}</div>
                                        <div className="notif-message">{notif.message}</div>
                                        <div className="notif-time">{new Date(notif.created_at).toLocaleString()}</div>
                                    </div>
                                )) : (
                                    <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>No new notifications.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <span className="role-badge">{user?.role?.toUpperCase()}</span>
            <span>{user?.email}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
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
