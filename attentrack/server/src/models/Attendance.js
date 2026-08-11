import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const format12HourTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Dynamic Attendance Status Calculation based on Workday Shift Start Time (09:00 AM)
 * - Clock-in at or before 09:15 AM -> "On Time"
 * - Clock-in after 09:15 AM -> "Late"
 */
export const calculateAttendanceStatus = (dateInput = new Date()) => {
  const date = dateInput instanceof Date && !isNaN(dateInput) ? dateInput : new Date(dateInput);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours < 9 || (hours === 9 && minutes <= 15)) {
    return 'On Time';
  }
  return 'Late';
};

export const AttendanceModel = {
  findAll: async () => {
    return await listGet('attendance');
  },

  findByEmployeeId: async (employeeId) => {
    const all = await listGet('attendance');
    return all.filter((att) => String(att.employeeId) === String(employeeId));
  },

  createLog: async (logData) => {
    const clockInDate = logData.timestamp ? new Date(logData.timestamp) : new Date();
    const calculatedStatus = calculateAttendanceStatus(clockInDate);
    const id = generateId();
    const newLog = {
      id,
      userId: logData.userId || logData.employeeId || 1,
      employeeId: logData.employeeId || logData.userId || 1,
      employeeName: logData.employeeName || 'Aiko Suzuki',
      date: clockInDate.toISOString().split('T')[0],
      timestamp: clockInDate.toISOString(),
      clockIn: format12HourTime(clockInDate),
      clockOut: '--',
      status: logData.status || calculatedStatus,
      hoursWorked: '0.0 hrs',
      imageUrl: logData.imageUrl || logData.capturedSelfie || null,
      location: logData.location || 'Office HQ',
      gpsCoordinates: logData.gpsCoordinates || null,
      method: logData.method || 'Selfie',
      ...logData,
      id
    };
    await rtdb.ref(`attendance/${id}`).set(newLog);
    return newLog;
  },

  markAttendance: async (data) => {
    const clockInDate = data.timestamp ? new Date(data.timestamp) : new Date();
    const calculatedStatus = calculateAttendanceStatus(clockInDate);
    const id = generateId();
    const newLog = {
      id,
      userId: data.userId || data.employeeId || 1,
      employeeId: data.employeeId || data.userId || 1,
      employeeName: data.employeeName || 'Aiko Suzuki',
      date: clockInDate.toISOString().split('T')[0],
      timestamp: clockInDate.toISOString(),
      clockIn: format12HourTime(clockInDate),
      clockOut: '--',
      status: data.status || calculatedStatus,
      hoursWorked: '0.0 hrs',
      imageUrl: data.imageUrl || null,
      location: data.location || 'Office HQ',
      gpsCoordinates: data.gpsCoordinates || { lat: 22.7063, lng: 72.8347 },
      method: data.method || 'Selfie'
    };
    await rtdb.ref(`attendance/${id}`).set(newLog);
    return newLog;
  },

  clockOut: async (id) => {
    const all = await listGet('attendance');
    // Try exact id match first
    let record = all.find((att) => String(att.id) === String(id));
    // Fallback: find first open clock-in (clockOut === '--')
    if (!record) {
      record = all.find((att) => !att.clockOut || att.clockOut === '--');
    }
    if (!record) return null;

    const updated = {
      ...record,
      clockOut: format12HourTime(),
      hoursWorked: '8.0 hrs'
    };
    await rtdb.ref(`attendance/${record.id}`).set(updated);
    return updated;
  }
};
