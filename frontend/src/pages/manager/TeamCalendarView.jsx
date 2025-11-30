import React, { useEffect, useState } from 'react';
import api from '../../api';

const TeamCalendarView = () => {
  const [date, setDate] = useState('');
  const [data, setData] = useState(null);

  const loadTodayStatus = async () => {
    const res = await api.get('/attendance/today-status');
    setData(res.data);
  };

  useEffect(() => {
    loadTodayStatus();
  }, []);

  // you could expand this into a full calendar, but here we show today's team status
  return (
    <div>
      <h2>Team Calendar View</h2>
      <p>
        This is a simplified "today" view. You can expand it to a full calendar if you like
        (using the attendance/all endpoint).
      </p>

      <button onClick={loadTodayStatus} style={{ marginBottom: '10px' }}>
        Refresh Today's Status
      </button>

      {data && (
        <>
          <p>
            Present: {data.presentCount}, Absent: {data.absentCount}, Late:{' '}
            {data.lateCount}
          </p>

          <h3>Present</h3>
          <ul>
            {data.present.map((r) => (
              <li key={r._id}>
                {r.user?.name} ({r.user?.employeeId}) - {r.status}
              </li>
            ))}
          </ul>

          <h3>Absent</h3>
          <ul>
            {data.absent.map((e) => (
              <li key={e._id}>
                {e.name} ({e.employeeId})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default TeamCalendarView;
