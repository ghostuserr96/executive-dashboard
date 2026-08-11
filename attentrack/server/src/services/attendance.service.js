import { AttendanceModel, calculateAttendanceStatus } from '../models/Attendance.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

// Office HQ Coordinates Configuration
const OFFICE_HQ = {
  latitude: 22.7063,
  longitude: 72.8347,
  maxAllowedRadiusMeters: 100
};

/**
 * Option A (Code-based): Haversine Formula
 * Calculates exact distance in meters between two GPS coordinates (lat1, lon1) and (lat2, lon2)
 */
export function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return 0;
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export class AttendanceService {
  static async getAttendanceLogs() {
    return await AttendanceModel.findAll();
  }

  static async clockIn(details) {
    if (!details.employeeId && !details.employeeName && !details.userId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Employee identification is required to clock in');
    }
    return await AttendanceModel.createLog(details);
  }

  static async markAttendance(details) {
    const { userId, employeeId, timestamp, imageUrl, location, gpsCoordinates, method } = details;
    if (!employeeId && !userId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User identification (userId/employeeId) is required to mark attendance');
    }

    // Backend Haversine Distance Validation & Geofencing Check
    let geofenceDistance = details.distance || 0;
    let isInsideGeofence = true;

    if (gpsCoordinates && gpsCoordinates.lat && gpsCoordinates.lng) {
      geofenceDistance = calculateHaversineDistanceMeters(
        gpsCoordinates.lat,
        gpsCoordinates.lng,
        OFFICE_HQ.latitude,
        OFFICE_HQ.longitude
      );
      isInsideGeofence = geofenceDistance <= OFFICE_HQ.maxAllowedRadiusMeters;
    }

    const clockInDate = timestamp ? new Date(timestamp) : new Date();
    const calculatedStatus = details.status || calculateAttendanceStatus(clockInDate);

    return await AttendanceModel.markAttendance({
      userId: userId || employeeId,
      employeeId: employeeId || userId,
      employeeName: details.employeeName || 'Aiko Suzuki',
      timestamp: timestamp || new Date().toISOString(),
      imageUrl: imageUrl || details.capturedSelfie || null,
      location: location || `GPS Geofence (${geofenceDistance}m away)`,
      gpsCoordinates: gpsCoordinates ? {
        ...gpsCoordinates,
        calculatedDistanceMeters: geofenceDistance,
        isInsideGeofence
      } : null,
      method: method || 'Selfie',
      status: calculatedStatus
    });
  }

  static async clockOut(logId) {
    const updated = await AttendanceModel.clockOut(logId);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, `Attendance record with ID ${logId} not found`);
    }
    return updated;
  }
}
