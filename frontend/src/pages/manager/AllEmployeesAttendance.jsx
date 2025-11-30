import React, { useEffect, useState } from 'react';
import api from '../../api';

const AllEmployeesAttendance = () => {
  const [filters, setFilters] = useState({
    employeeId: '',
    date: '',
    status: ''
  });
  const [records, setRecords] = useState([]);

  const load = async () => {
    const res = await api.get('/attendance/all', {
      params: {
        employeeId: filters.employeeId || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined
      }
    });
    setRecords(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div>
      <h2>All Employees Attendance</h2>
      <form onSubmit={applyFilters} style={{ marginBottom: '15px' }}>
        <input
          name="employeeId"
          placeholder="Employee ID"
          value={filters.employeeId}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          name="date"
          placeholder="YYYY-MM-DD"
          value={filters.date}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        >
          <option value="">All</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half-day">Half-day</option>
        </select>
        <button type="submit">Filter</button>
      </form>

      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Emp ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td>{r.date}</td>
              <td>{r.user?.employeeId}</td>
              <td>{r.user?.name}</td>
              <td>{r.user?.department}</td>
              <td>{r.status}</td>
              <td>{r.checkInTime && new Date(r.checkInTime).toLocaleTimeString()}</td>
              <td>{r.checkOutTime && new Date(r.checkOutTime).toLocaleTimeString()}</td>
              <td>{r.totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllEmployeesAttendance;
