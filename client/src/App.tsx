import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import Tasks from './pages/Tasks';
import GroupTasks from './pages/GroupTasks';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Course from './pages/Course';
import AddTaskForm from './components/AddTaskForm';
import Dashboard from './pages/Dashboard';
import TaskCalendar from './pages/Calendar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ...existing code...

// added group components
import GroupList from './components/group/UserGroupList';
import GroupDetail from './components/group/GroupDetail';
import GroupForm from './components/group/GroupForm';

// Helper component for active link styling
const SidebarNavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className={isActive ? 'active-link' : ''}>
      <Link to={to}>{children}</Link>
    </li>
  );
};

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [showOverlay, setShowOverlay] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isRegisterPage = location.pathname === '/register'; // Check if the current path is '/register'
    if (!token && !isRegisterPage) { // Prevent redirection if on '/register'
      localStorage.setItem('redirectPath', location.pathname);
      navigate('/login');
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      setIsSidebarCollapsed(mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = (token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    const redirectPath = localStorage.getItem('redirectPath') || '/dashboard';
    setIsAuthenticated(true);
    toast.success('Login successful!');
    navigate(redirectPath);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('redirectPath');
    setIsAuthenticated(false);
    setShowLogoutOverlay(false);
    toast.info('Logged out successfully!');
    navigate('/login');
  };

  const handleAddTask = () => {
    setSuccessMessage('Task added successfully!');
    toast.success('Task added successfully!'); // Added toast notification
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
    setShowOverlay(false);
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="app">
      {isAuthenticated && (
        <>
          {isMobileView && (
            <button className="hamburger-menu" onClick={toggleSidebar}>
              {isSidebarCollapsed ? '✕' : '☰'}
            </button>
          )}
          <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            <div className="avatar-container">
              <Link to="/profile">
                <div className="avatar"></div>
              </Link>
            </div>
            <button className="add-task-button" onClick={() => setShowOverlay(true)}>
              + Add Task
            </button>
            <nav className="sidebar-nav">
              <ul className="sidebar-links">
                <SidebarNavLink to="/dashboard">Dashboard</SidebarNavLink>
                <SidebarNavLink to="/courses">Courses</SidebarNavLink>
                <SidebarNavLink to="/tasks">Tasks</SidebarNavLink>
                <SidebarNavLink to="/groups">Groups</SidebarNavLink> {/* added groups link */}
                <SidebarNavLink to="/group-tasks">Group Tasks</SidebarNavLink>
                <SidebarNavLink to="/analytics">Analytics</SidebarNavLink>
                <SidebarNavLink to="/calendar">Calendar</SidebarNavLink>
              </ul>
              <div className="sidebar-footer">
                <button className="logout-button" onClick={() => setShowLogoutOverlay(true)}>
                  Logout
                </button>
              </div>
            </nav>
          </aside>
        </>
      )}
      <main className={`main-content ${!isAuthenticated ? 'full-width' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} />
          <Route path="/group-tasks" element={isAuthenticated ? <GroupTasks /> : <Navigate to="/login" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={isAuthenticated ? <TaskCalendar /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/courses" element={isAuthenticated ? <Course /> : <Navigate to="/login" />} />

          {/* group CRUD routes */}
          <Route path="/groups" element={isAuthenticated ? <GroupList /> : <Navigate to="/login" />} />
          <Route path="/groups/new" element={isAuthenticated ? <GroupForm /> : <Navigate to="/login" />} />
          <Route path="/groups/:id" element={isAuthenticated ? <GroupDetail /> : <Navigate to="/login" />} />
          <Route path="/groups/:id/edit" element={isAuthenticated ? <GroupForm /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
      {showOverlay && isAuthenticated && (
        <div className="overlay">
          <div className="overlay-content">
            <AddTaskForm onAddTask={handleAddTask} onClose={() => setShowOverlay(false)} />
          </div>
        </div>
      )}
      {showLogoutOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Are you sure you want to logout?</h3>
            <div className="overlay-buttons">
              <button onClick={handleLogout}>Yes</button>
              <button onClick={() => setShowLogoutOverlay(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

const App: React.FC = () => {
  const GOOGLE_CLIENT_ID = "329869064237-kclvre8bq3sdnee4s6vn4a22vr2nj076.apps.googleusercontent.com";

  return (
    <Router>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ToastContainer />
        <AppContent />
      </GoogleOAuthProvider>
    </Router>
  );
};

export default App;