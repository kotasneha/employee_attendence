const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { generateCSV } = require('../utils/csvExporter');

const router = express.Router();

// Helper: today string in YYYY-MM-DD
const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Employee: POST /api/attendance/checkin
router.post('/checkin', protect, requireRole('employee'), async (req, res) => {
  try {
    const user = req.user;
    const today = getTodayString();

    let record = await Attendance.findOne({ user: user._id, date: today });

    if (record && record.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();

    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
    const status = isLate ? 'late' : 'present';

    if (!record) {
      record = new Attendance({
        user: user._id,
        date: today,
        checkInTime: now,
        status
      });
    } else {
      record.checkInTime = now;
      record.status = status;
    }

    await record.save();
    res.json(record);
  } catch (err) {
    console.error('Checkin error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: POST /api/attendance/checkout
router.post('/checkout', protect, requireRole('employee'), async (req, res) => {
  try {
    const user = req.user;
    const today = getTodayString();

    const record = await Attendance.findOne({ user: user._id, date: today });
    if (!record || !record.checkInTime) {
      return res.status(400).json({ message: 'Check-in first' });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const now = new Date();
    record.checkOutTime = now;

    const diffMs = now.getTime() - record.checkInTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    record.totalHours = Number(hours.toFixed(2));

    if (hours < 4) {
      record.status = 'half-day';
    }

    await record.save();
    res.json(record);
  } catch (err) {
    console.error('Checkout error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: GET /api/attendance/my-history?month=YYYY-MM
router.get('/my-history', protect, requireRole('employee'), async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const user = req.user;

    let query = { user: user._id };
    if (month) {
      query.date = { $regex: `^${month}` };
    }

    const history = await Attendance.find(query).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    console.error('My-history error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: GET /api/attendance/my-summary?month=YYYY-MM
router.get('/my-summary', protect, requireRole('employee'), async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const user = req.user;

    const regex = month ? `^${month}` : '^';
    const records = await Attendance.find({
      user: user._id,
      date: { $regex: regex }
    });

    let present = 0,
      absent = 0,
      late = 0,
      halfDay = 0,
      totalHours = 0;

    records.forEach((r) => {
      if (r.status === 'present') present++;
      if (r.status === 'absent') absent++;
      if (r.status === 'late') late++;
      if (r.status === 'half-day') halfDay++;
      totalHours += r.totalHours || 0;
    });

    res.json({
      month: month || 'all',
      presentDays: present,
      absentDays: absent,
      lateDays: late,
      halfDays: halfDay,
      totalHours
    });
  } catch (err) {
    console.error('My-summary error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee: GET /api/attendance/today
router.get('/today', protect, requireRole('employee'), async (req, res) => {
  try {
    const today = getTodayString();
    const record = await Attendance.findOne({ user: req.user._id, date: today });
    res.json(record || null);
  } catch (err) {
    console.error('Today status error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
  Manager APIs
*/

// Manager: GET /api/attendance/all?employeeId=&date=&status=
router.get('/all', protect, requireRole('manager'), async (req, res) => {
  try {
    const { employeeId, date, status } = req.query;

    const userFilter = {};
    if (employeeId) userFilter.employeeId = employeeId;

    const users = await User.find(userFilter).select('_id name employeeId department');
    const userIds = users.map((u) => u._id);

    const attendanceFilter = { user: { $in: userIds } };
    if (date) attendanceFilter.date = date;
    if (status) attendanceFilter.status = status;

    const records = await Attendance.find(attendanceFilter)
      .populate('user', 'name employeeId department')
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error('All attendance error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: GET /api/attendance/employee/:id (id = userId)
router.get('/employee/:id', protect, requireRole('manager'), async (req, res) => {
  try {
    const { id } = req.params;

    const records = await Attendance.find({ user: id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error('Employee attendance error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: GET /api/attendance/summary?from=&to=
router.get('/summary', protect, requireRole('manager'), async (req, res) => {
  try {
    const { from, to } = req.query; // YYYY-MM-DD

    const filter = {};
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    }

    const records = await Attendance.find(filter).populate('user', 'department');

    const summary = {};
    records.forEach((r) => {
      const dept = r.user?.department || 'Unknown';
      if (!summary[dept]) {
        summary[dept] = { present: 0, absent: 0, late: 0, halfDay: 0 };
      }
      if (r.status === 'present') summary[dept].present++;
      if (r.status === 'absent') summary[dept].absent++;
      if (r.status === 'late') summary[dept].late++;
      if (r.status === 'half-day') summary[dept].halfDay++;
    });

    res.json(summary);
  } catch (err) {
    console.error('Summary error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: GET /api/attendance/today-status
router.get('/today-status', protect, requireRole('manager'), async (req, res) => {
  try {
    const today = getTodayString();

    const employees = await User.find({ role: 'employee' }).select(
      '_id name employeeId department'
    );

    const attendance = await Attendance.find({ date: today }).populate(
      'user',
      'name employeeId department'
    );

    const presentMap = {};
    attendance.forEach((a) => {
      presentMap[a.user._id.toString()] = a;
    });

    const present = [];
    const absent = [];
    const late = [];

    employees.forEach((e) => {
      const rec = presentMap[e._id.toString()];
      if (!rec) {
        absent.push(e);
      } else {
        if (rec.status === 'late') {
          late.push(rec);
        }
        present.push(rec);
      }
    });

    res.json({
      presentCount: present.length,
      absentCount: absent.length,
      lateCount: late.length,
      present,
      absent,
      late
    });
  } catch (err) {
    console.error('Today-status error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: GET /api/attendance/export?from=&to=&employeeId=
router.get('/export', protect, requireRole('manager'), async (req, res) => {
  try {
    const { from, to, employeeId } = req.query;

    const userFilter = {};
    if (employeeId) userFilter.employeeId = employeeId;
    const users = await User.find(userFilter);
    const userMap = {};
    users.forEach((u) => (userMap[u._id.toString()] = u));

    const filter = { user: { $in: users.map((u) => u._id) } };
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    }

    const records = await Attendance.find(filter);

    const rows = records.map((r) => {
      const u = userMap[r.user.toString()];
      return {
        employeeId: u.employeeId,
        name: u.name,
        department: u.department,
        date: r.date,
        status: r.status,
        checkInTime: r.checkInTime ? r.checkInTime.toISOString() : '',
        checkOutTime: r.checkOutTime ? r.checkOutTime.toISOString() : '',
        totalHours: r.totalHours || 0
      };
    });

    const csv = await generateCSV(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Export error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
