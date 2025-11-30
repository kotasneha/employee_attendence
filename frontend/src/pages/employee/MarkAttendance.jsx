import React, { useEffect, useState } from 'react';
import api from '../../api';

const MarkAttendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadToday = async () => {
    const res = await api.get('/attendance/today');
    setTodayRecord(res.data);
  };

  useEffect(() => {
    loadToday();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkin');
      await loadToday();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post('/attendance/checkout');
      await loadToday();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const checkedIn = !!todayRecord?.checkInTime;
  const checkedOut = !!todayRecord?.checkOutTime;

  return (
    <div>
      <h2>Mark Attendance</h2>
      <p>
        Today status:{' '}
        {checkedOut ? 'Checked out' : checkedIn ? 'Checked in' : 'Not checked in'}
      </p>
      <button
        onClick={handleCheckIn}
        disabled={loading || checkedIn}
        style={{ marginRight: '10px' }}
      >
        Check In
      </button>
      <button onClick={handleCheckOut} disabled={loading || !checkedIn || checkedOut}>
        Check Out
      </button>
      {todayRecord && (
        <div style={{ marginTop: '20px' }}>
          <p>
            Check-in:{' '}
            {todayRecord.checkInTime &&
              new Date(todayRecord.checkInTime).toLocaleTimeString()}
          </p>
          <p>
            Check-out:{' '}
            {todayRecord.checkOutTime &&
              new Date(todayRecord.checkOutTime).toLocaleTimeString()}
          </p>
          <p>Total hours: {todayRecord.totalHours}</p>
          <p>Status: {todayRecord.status}</p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
