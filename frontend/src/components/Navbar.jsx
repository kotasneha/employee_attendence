import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}
    >
      <div>
        <strong>Attendance</strong>
      </div>
      <div>
        {!user ? (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>
              Login
            </Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'employee' && (
              <>
                <Link to="/employee/dashboard" style={{ marginRight: '10px' }}>
                  Dashboard
                </Link>
                <Link to="/employee/attendance" style={{ marginRight: '10px' }}>
                  History
                </Link>
                <Link to="/employee/mark" style={{ marginRight: '10px' }}>
                  Mark
                </Link>
                <Link to="/employee/profile" style={{ marginRight: '10px' }}>
                  Profile
                </Link>
              </>
            )}
            {user.role === 'manager' && (
              <>
                <Link to="/manager/dashboard" style={{ marginRight: '10px' }}>
                  Dashboard
                </Link>
                <Link to="/manager/attendance" style={{ marginRight: '10px' }}>
                  Attendance
                </Link>
                <Link to="/manager/calendar" style={{ marginRight: '10px' }}>
                  Calendar
                </Link>
                <Link to="/manager/reports" style={{ marginRight: '10px' }}>
                  Reports
                </Link>
              </>
            )}
            <span style={{ marginRight: '10px' }}>{user.name}</span>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
