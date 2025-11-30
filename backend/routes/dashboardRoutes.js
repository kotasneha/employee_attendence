const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const router = express.Router();

const getTodayString = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Employee dashboard: GET /api/dashboard/employee?month=YYYY-MM
router.get('/employee', protect, requireRole('employee'), async (req, res) => {
  try {
    const user = req.user;
    const { month } = req.query;
    const today = getTodayString();

    const todayRecord = await Attendance.findOne({ user: user._id, date: today });

    const regex = month ? `^${month}` : '^';
    const records = await Attendance.find({
      user: user._id,
      date: { $regex: regex }
    }).sort({ date: -1 });

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

    const recent = records.slice(0, 7);

    res.json({
      todayStatus: todayRecord
        ? todayRecord.checkOutTime
          ? 'checked-out'
          : 'checked-in'
        : 'not-checked-in',
      todayRecord,
      monthSummary: {
        presentDays: present,
        absentDays: absent,
        lateDays: late,
        halfDays: halfDay,
        totalHours
      },
      recentAttendance: recent
    });
  } catch (err) {
    console.error('Employee dashboard error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager dashboard: GET /api/dashboard/manager
router.get('/manager', protect, requireRole('manager'), async (req, res) => {
  try {
    const today = getTodayString();

    const totalEmployees = await User.countDocuments({ role: 'employee' });

    const todaysAttendance = await Attendance.find({ date: today }).populate(
      'user',
      'name employeeId department'
    );

    const presentCount = todaysAttendance.length;

    const allEmployees = await User.find({ role: 'employee' }).select(
      '_id name employeeId department'
    );
    const absentCount = allEmployees.length - presentCount;

    const lateArrivals = todaysAttendance.filter((r) => r.status === 'late');

    // Weekly trend: last 7 days
    const now = new Date();
    const dailyStats = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${day}`;

      const dayRecords = await Attendance.find({ date: ds });
      dailyStats.push({
        date: ds,
        present: dayRecords.length,
        // you could calculate absent here if you want using total employees
      });
    }

    // Department-wise attendance today
    const departmentSummary = {};
    todaysAttendance.forEach((r) => {
      const dept = r.user?.department || 'Unknown';
      if (!departmentSummary[dept]) {
        departmentSummary[dept] = { present: 0, absent: 0 };
      }
      departmentSummary[dept].present++;
    });

    Object.keys(departmentSummary).forEach((dept) => {
      const deptEmployees = allEmployees.filter((e) => e.department === dept).length;
      const present = departmentSummary[dept].present;
      departmentSummary[dept].absent = deptEmployees - present;
    });

    const todayAbsentEmployeesIds = new Set(
      todaysAttendance.map((r) => r.user._id.toString())
    );
    const todayAbsentEmployees = allEmployees.filter(
      (e) => !todayAbsentEmployeesIds.has(e._id.toString())
    );

    res.json({
      totalEmployees,
      today: {
        present: presentCount,
        absent: absentCount,
        late: lateArrivals.length
      },
      lateArrivals,
      weeklyTrend: dailyStats,
      departmentSummary,
      todayAbsentEmployees
    });
  } catch (err) {
    console.error('Manager dashboard error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
