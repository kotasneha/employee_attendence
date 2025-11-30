import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import MyAttendanceHistory from './pages/employee/MyAttendanceHistory';
import Profile from './pages/employee/Profile';

import ManagerDashboard from './pages/manager/ManagerDashboard';
import AllEmployeesAttendance from './pages/manager/AllEmployeesAttendance';
import TeamCalendarView from './pages/manager/TeamCalendarView';
import Reports from './pages/manager/Reports';

const App = () => {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '0 20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee routes */}
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/mark" element={<MarkAttendance />} />
            <Route path="/employee/attendance" element={<MyAttendanceHistory />} />
            <Route path="/employee/profile" element={<Profile />} />
          </Route>

          {/* Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/attendance" element={<AllEmployeesAttendance />} />
            <Route path="/manager/calendar" element={<TeamCalendarView />} />
            <Route path="/manager/reports" element={<Reports />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
