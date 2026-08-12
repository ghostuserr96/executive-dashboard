import { EmployeeModel } from '../models/Employee.js';
import { AttendanceModel } from '../models/Attendance.js';
import { PerformanceModel } from '../models/Performance.js';
import { TaskModel } from '../models/Task.js';
import { LeaveModel } from '../models/Leave.js';

export const syncRealData = async () => {
  console.log('🔄 Real Data Sync Engine started (Calculating ML fields from actual modules)...');
  try {
    const employees = await EmployeeModel.findAll();
    
    // Fetch all related data upfront to avoid too many DB calls
    const allAttendance = await AttendanceModel.findAll();
    const allPerformance = await PerformanceModel.findAll();
    const allTasks = await TaskModel.findAll();
    const allLeaves = await LeaveModel.findAll();

    for (const emp of employees) {
      if (emp.status === 'Terminated') continue;

      const empIdStr = String(emp.id);

      // 1. YearsAtCompany
      let yearsAtCompany = 0;
      if (emp.joinDate) {
        const join = new Date(emp.joinDate);
        const diffMs = Date.now() - join.getTime();
        yearsAtCompany = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      }
      // Ensure at least 0
      yearsAtCompany = Math.max(0, yearsAtCompany);

      // 2. PerformanceRating (1-4)
      const empReviews = allPerformance.filter(r => String(r.employeeId) === empIdStr);
      let performanceRating = 3; // Default Good/Excellent
      if (empReviews.length > 0) {
        // Average overallScore
        const avgScore = empReviews.reduce((sum, r) => sum + (Number(r.overallScore) || 0), 0) / empReviews.length;
        if (avgScore >= 90) performanceRating = 4;
        else if (avgScore >= 75) performanceRating = 3;
        else if (avgScore >= 60) performanceRating = 2;
        else performanceRating = 1;
      }

      // 3. OverTime (Yes/No)
      const empAttendance = allAttendance.filter(a => String(a.employeeId) === empIdStr);
      let overTime = 'No';
      if (empAttendance.length > 0) {
        // Count how many times they clocked out after 18:00 (6 PM)
        let overtimeDays = 0;
        for (const log of empAttendance) {
          if (log.clockOut) {
            // ClockOut is often in 12-hour format or ISO. Let's parse securely.
            // If it's a date string or ISO
            try {
              let hour = 17; 
              if (log.clockOut.includes('PM')) {
                 const hourStr = log.clockOut.split(':')[0];
                 const h = parseInt(hourStr, 10);
                 hour = h === 12 ? 12 : h + 12;
              } else if (log.clockOut.includes('AM')) {
                 hour = 9;
              } else if (log.clockOut.includes('T')) {
                 hour = new Date(log.clockOut).getHours();
              }
              if (hour >= 18) overtimeDays++;
            } catch (e) {
              // fallback
            }
          }
        }
        // If they have overtime on >30% of their recorded days, flag them
        if (overtimeDays / empAttendance.length >= 0.3) {
          overTime = 'Yes';
        }
      }

      // 4. JobInvolvement (1-4) & WorkLifeBalance (1-4)
      const empTasks = allTasks.filter(t => String(t.assigneeId) === empIdStr || String(t.assignee) === empIdStr || t.assigneeName === emp.name);
      const empLeaves = allLeaves.filter(l => String(l.employeeId) === empIdStr);
      
      const doneTasks = empTasks.filter(t => t.status === 'Done');
      const pendingTasks = empTasks.filter(t => t.status !== 'Done');

      let jobInvolvement = 3; 
      if (empTasks.length > 0) {
        const completionRate = doneTasks.length / empTasks.length;
        if (completionRate >= 0.8) jobInvolvement = 4;
        else if (completionRate >= 0.5) jobInvolvement = 3;
        else if (completionRate >= 0.2) jobInvolvement = 2;
        else jobInvolvement = 1;
      }

      let workLifeBalance = 3;
      // Approved leaves
      const approvedLeaves = empLeaves.filter(l => l.status === 'Approved');
      let totalLeaveDays = 0;
      approvedLeaves.forEach(l => {
         const start = new Date(l.startDate);
         const end = new Date(l.endDate);
         if (!isNaN(start) && !isNaN(end)) {
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            totalLeaveDays += diffDays;
         }
      });

      if (pendingTasks.length > 20 && totalLeaveDays < 5) {
        workLifeBalance = 1; // Extremely burnt out
      } else if (pendingTasks.length > 10 && totalLeaveDays < 10) {
        workLifeBalance = 2;
      } else if (totalLeaveDays > 15) {
        workLifeBalance = 4; // Great WLB
      }

      // Also let's adjust jobSatisfaction mathematically based on these
      // If they have low performance, overtime, and bad WLB, satisfaction will be low.
      let jobSatisfaction = 3;
      let penalty = 0;
      if (overTime === 'Yes') penalty++;
      if (workLifeBalance <= 2) penalty++;
      if (performanceRating <= 2) penalty++;
      
      if (penalty >= 3) jobSatisfaction = 1;
      else if (penalty === 2) jobSatisfaction = 2;
      else if (penalty === 0 && workLifeBalance === 4) jobSatisfaction = 4;

      // Update the employee in the database!
      await EmployeeModel.update(emp.id, {
        yearsAtCompany,
        performanceRating,
        overTime,
        jobInvolvement,
        workLifeBalance,
        jobSatisfaction,
        // Fill other defaults if they are missing
        age: emp.age !== undefined ? emp.age : 35,
        distanceFromHome: emp.distanceFromHome !== undefined ? emp.distanceFromHome : 5,
        education: emp.education !== undefined ? emp.education : 3,
        numCompaniesWorked: emp.numCompaniesWorked !== undefined ? emp.numCompaniesWorked : 1,
        jobLevel: emp.jobLevel !== undefined ? emp.jobLevel : 1,
        totalWorkingYears: emp.totalWorkingYears !== undefined ? emp.totalWorkingYears : 10,
        monthlyIncome: emp.monthlyIncome !== undefined ? emp.monthlyIncome : null,
        percentSalaryHike: emp.percentSalaryHike !== undefined ? emp.percentSalaryHike : 15,
        trainingTimesLastYear: emp.trainingTimesLastYear !== undefined ? emp.trainingTimesLastYear : 2,
        environmentSatisfaction: emp.environmentSatisfaction !== undefined ? emp.environmentSatisfaction : 3,
        relationshipSatisfaction: emp.relationshipSatisfaction !== undefined ? emp.relationshipSatisfaction : 3,
      });
    }

    console.log('✅ Real Data Sync Engine: Successfully synced all ML metrics.');
  } catch (err) {
    console.error('Error in Real Data Sync Engine:', err);
    throw err;
  }
};
