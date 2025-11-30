import React, { useEffect, useState } from 'react';
import api from '../../api';

// simple color mapping
const statusColor = (status) => {
  switch (status) {
    case 'present':
      return 'lightgreen';
    case 'absent':
      return '#ffb3b3';
    case 'late':
      return '#ffe680';
    case 'half-day':
      return '#ffcc99';
    default:
      return '#fff';
  }
};

const MyAttendanceHistory = () => {
  const [month, setMonth] = useState('');
  const [records, setRecords] = useState([]);

  const load = async () => {
    const res = await api.get('/attendance/my-history', {
      params: { month: month || undefined }
    });
    setRecords(res.data);
  };

  useEffect(() => {
    load();
  }, [month]);

  // naive "calendar" grouping by date
  const byDate = {};
  records.forEach((r) => {
    byDate[r.date] = r;
  });
  const dates = Object.keys(byDate).sort();

  return (
    <div>
      <h2>My Attendance History</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Filter by month (YYYY-MM): </label>
        <input
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="2025-11"
        />
      </div>

      <h3>Calendar View (simple)</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '600px' }}>
        {dates.map((d) => (
          <div
            key={d}
            style={{
              border: '1px solid #ddd',
              width: '80px',
              height: '60px',
              margin: '4px',
              backgroundColor: statusColor(byDate[d].status),
              padding: '4px',
              fontSize: '12px'
            }}
          >
            <strong>{d.split('-')[2]}</strong>
            <br />
            {byDate[d].status}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '20px' }}>Table View</h3>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Date</th>
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

export default MyAttendanceHistory;
