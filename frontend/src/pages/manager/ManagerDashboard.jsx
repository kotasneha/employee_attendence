import React, { useEffect, useState } from 'react';
import api from '../../api';

const ManagerDashboard = () => {
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await api.get('/dashboard/manager');
    setData(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Manager Dashboard</h2>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ border: '1px solid #ddd', padding: '10px', minWidth: '200px' }}>
          <h4>Total Employees</h4>
          <p>{data.totalEmployees}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '10px', minWidth: '200px' }}>
          <h4>Today's Attendance</h4>
          <p>Present: {data.today.present}</p>
          <p>Absent: {data.today.absent}</p>
          <p>Late: {data.today.late}</p>
        </div>
      </div>

      <h3>Late Arrivals Today</h3>
      <table border="1" cellPadding="4">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Check In</th>
          </tr>
        </thead>
        <tbody>
          {data.lateArrivals.map((r) => (
            <tr key={r._id}>
              <td>{r.user?.name}</td>
              <td>{r.user?.department}</td>
              <td>{r.checkInTime && new Date(r.checkInTime).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: '20px' }}>Weekly Attendance Trend</h3>
      <ul>
        {data.weeklyTrend.map((d) => (
          <li key={d.date}>
            {d.date}: {d.present} present
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: '20px' }}>Department-wise Attendance (today)</h3>
      <ul>
        {Object.entries(data.departmentSummary).map(([dept, stats]) => (
          <li key={dept}>
            {dept}: {stats.present} present, {stats.absent} absent
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: '20px' }}>Absent Employees Today</h3>
      <ul>
        {data.todayAbsentEmployees.map((e) => (
          <li key={e._id}>
            {e.name} ({e.employeeId}) - {e.department}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagerDashboard;
