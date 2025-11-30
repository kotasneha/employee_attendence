import React, { useState } from 'react';
import api from '../../api';

const Reports = () => {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    employeeId: ''
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/attendance/all', {
        params: {
          employeeId: filters.employeeId || undefined,
          date: undefined, // using range via summary/export if you want
          status: undefined
        }
      });

      // For simplicity: we ignore from/to here and just filter client-side
      const { from, to } = filters;
      const filtered = res.data.filter((r) => {
        if (!from && !to) return true;
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        return true;
      });

      setRecords(filtered);
    } catch (err) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.employeeId) params.append('employeeId', filters.employeeId);

    const url = `http://localhost:5000/api/attendance/export?${params.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2>Reports</h2>
      <form onSubmit={generate} style={{ marginBottom: '15px' }}>
        <input
          name="from"
          placeholder="From (YYYY-MM-DD)"
          value={filters.from}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          name="to"
          placeholder="To (YYYY-MM-DD)"
          value={filters.to}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <input
          name="employeeId"
          placeholder="Employee ID or empty"
          value={filters.employeeId}
          onChange={handleChange}
          style={{ marginRight: '5px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
        <button type="button" onClick={exportCSV} style={{ marginLeft: '10px' }}>
          Export CSV
        </button>
      </form>

      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Emp ID</th>
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

export default Reports;
