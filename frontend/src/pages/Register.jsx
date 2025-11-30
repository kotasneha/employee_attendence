import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    employeeId: '',
    department: ''
  });
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      if (form.role === 'employee') nav('/employee/dashboard');
      else nav('/manager/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name</label>
          <input
            style={{ width: '100%' }}
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input
            style={{ width: '100%' }}
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input
            style={{ width: '100%' }}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Role</label>
          <select
            style={{ width: '100%' }}
            name="role"
            value={form.role}
            onChange={onChange}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Employee ID</label>
          <input
            style={{ width: '100%' }}
            name="employeeId"
            value={form.employeeId}
            onChange={onChange}
            placeholder="EMP001"
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Department</label>
          <input
            style={{ width: '100%' }}
            name="department"
            value={form.department}
            onChange={onChange}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
