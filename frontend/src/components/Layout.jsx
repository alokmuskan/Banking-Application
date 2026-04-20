import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.customerId) {
        try {
          const resp = await axios.get(`http://localhost:5000/api/support/notifications/${user.customerId}`);
          setNotifications(resp.data);
        } catch (err) {}
      }
    };
    fetchNotifications();
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden bg-nexus-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar notifications={notifications} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;