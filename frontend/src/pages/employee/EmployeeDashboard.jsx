import React, { useEffect, useState } from 'react';
import api from '../../api';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [month, setMonth] = useState('');

  const load = async () => {
    const res = await api.get('/dashboard/employee', {
      params: { month: month || undefined }
    });
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, [month]);

  if (!data) return <p>Loading...</p>;

  const { todayStatus, monthSummary, recentAttendance, todayRecord } = data;

  return (
    <div>
      <h2>Employee Dashboard</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>Month (YYYY-MM): </label>
        <input
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="2025-11"
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ border: '1px solid #ddd', padding: '10px', minWidth: '200px' }}>
          <h4>Today's Status</h4>
          <p>{todayStatus}</p>
          {todayRecord && (
            <>
              <p>Check-in: {todayRecord.checkInTime && new Date(todayRecord.checkInTime).toLocaleTimeString()}</p>
              <p>Check-out: {todayRecord.checkOutTime && new Date(todayRecord.checkOutTime).toLocaleTimeString()}</p>
            </>
          )}
        </div>

        <div style={{ border: '1px solid #ddd', padding: '10px', minWidth: '200px' }}>
          <h4>This Month Summary</h4>
          <p>Present: {monthSummary.presentDays}</p>
          <p>Absent: {monthSummary.absentDays}</p>
          <p>Late: {monthSummary.lateDays}</p>
          <p>Half-day: {monthSummary.halfDays}</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '10px', minWidth: '200px' }}>
          <h4>Total Hours</h4>
          <p>{monthSummary.totalHours.toFixed(2)} hrs</p>
        </div>
      </div>

      <div>
        <h3>Recent Attendance (last 7 days)</h3>
        <table border="1" cellPadding="4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td>{r.status}</td>
                <td>{r.totalHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
