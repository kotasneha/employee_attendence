# Employee Attendance Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) based Employee Attendance Tracking System with role-based authentication for **Employees** and **Managers**.

## 🚀 Tech Stack

### Frontend
- React
- Redux Toolkit / Zustand (state management)
- React Router
- Axios
- TailwindCSS / Material UI

### Backend
- Node.js
- Express.js
- JWT Authentication & Role-Based Access
- MongoDB (Mongoose ORM)
- CSV Export Support

### Database
- MongoDB Atlas

---

## 👤 User Roles

### **Employee**
- Register / Login
- Mark Attendance (Check-In / Check-Out)
- View Attendance Calendar / Table
- Monthly Summary (Present / Absent / Late / Half Day)
- Dashboard stats

### **Manager**
- Login
- View all employees attendance
- Filters (date, employee, status)
- Export CSV
- Team attendance dashboard
- Today’s present / absent list

---

## 🧾 Required Pages

### **Employee**
| Page | Description |
|-------|------------|
| Login / Register | Authentication |
| Dashboard | Summary + Quick Check-In/Out |
| Mark Attendance | Attendance actions |
| Attendance History | Calendar + Table |
| Profile | Personal details |

### **Manager**
| Page | Description |
|-------|------------|
| Login | Manager Authentication |
| Dashboard | Team Summary + Charts |
| All Attendance | Full list with filters |
| Team Calendar | Team daily view |
| Reports | Export CSV |

---

## 🗄 Database Schema

### Users
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "hashed",
  "role": "employee | manager",
  "employeeId": "EMP001",
  "department": "string",
  "createdAt": "timestamp"
}
