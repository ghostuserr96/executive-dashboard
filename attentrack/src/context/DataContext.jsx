import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { employeeService } from '../services/employeeService';
import { attendanceService } from '../services/attendanceService';
import { leaveService } from '../services/leaveService';
import { taskService } from '../services/taskService';
import { performanceService } from '../services/performanceService';
import { recruitmentService } from '../services/recruitmentService';
import { announcementService } from '../services/announcementService';
import { documentService } from '../services/documentService';

const DataContext = createContext();

const getTodaysBirthdays = (employees) => {
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  return employees
    .filter((emp) => {
      if (!emp.dob) return false;
      const dob = new Date(emp.dob);
      if (isNaN(dob.getTime())) return false;
      return dob.getMonth() === todayMonth && dob.getDate() === todayDay;
    })
    .map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.department || emp.role || 'Team Member',
      avatar: emp.avatar
    }));
};

const getUpcomingAnniversaries = (employees) => {
  const today = new Date();
  const todayMs = today.getTime();
  const results = [];

  for (const emp of employees) {
    if (!emp.joinDate) continue;
    const join = new Date(emp.joinDate);
    const yearsWorked = today.getFullYear() - join.getFullYear();
    if (yearsWorked < 1) continue;

    const nextAnniv = new Date(today.getFullYear(), join.getMonth(), join.getDate());
    if (nextAnniv.getTime() < todayMs) {
      nextAnniv.setFullYear(today.getFullYear() + 1);
    }
    const daysUntil = Math.ceil((nextAnniv.getTime() - todayMs) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 60) {
      results.push({
        id: emp.id,
        name: emp.name,
        role: emp.department || emp.role || 'Team Member',
        tenure: `${yearsWorked} years`,
        avatar: emp.avatar
      });
    }
  }
  return results.slice(0, 6);
};

export const DataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [recruitmentJobs, setRecruitmentJobs] = useState([]);
  const [recruitmentCandidates, setRecruitmentCandidates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todaysBirthdays = useMemo(() => getTodaysBirthdays(employees), [employees]);
  const workAnniversaries = useMemo(() => getUpcomingAnniversaries(employees), [employees]);

  const refreshAll = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const [empRes, attRes, leaveRes, taskRes, perfRes, jobRes, candRes, annRes, docRes] = await Promise.allSettled([
        employeeService.getAll(),
        attendanceService.getLogs(),
        leaveService.getAll(),
        taskService.getAll(),
        performanceService.getAll(),
        recruitmentService.getJobs(),
        recruitmentService.getCandidates(),
        announcementService.getAll(),
        documentService.getAll()
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.data) setEmployees(empRes.value.data);
      if (attRes.status === 'fulfilled' && attRes.value?.data) setAttendance(attRes.value.data);
      if (leaveRes.status === 'fulfilled' && leaveRes.value?.data) setLeaves(leaveRes.value.data);
      if (taskRes.status === 'fulfilled' && taskRes.value?.data) setTasks(taskRes.value.data);
      if (perfRes.status === 'fulfilled' && perfRes.value?.data) setPerformance(perfRes.value.data);
      if (jobRes.status === 'fulfilled' && jobRes.value?.data) setRecruitmentJobs(jobRes.value.data);
      if (candRes.status === 'fulfilled' && candRes.value?.data) setRecruitmentCandidates(candRes.value.data);
      if (annRes.status === 'fulfilled' && annRes.value?.data) setAnnouncements(annRes.value.data);
      if (docRes.status === 'fulfilled' && docRes.value?.data) setDocuments(docRes.value.data);
    } catch (err) {
      console.error('Failed fetching core data:', err);
      if (!isSilent) setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial fetch + Automatic 3-Second Real-Time Live Activity Polling
  useEffect(() => {
    refreshAll();

    const intervalId = setInterval(() => {
      refreshAll(true); // Silent background auto-sync without triggering full screen loading spinner
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const refreshAnnouncements = async () => {
    try {
      const res = await announcementService.getAll();
      if (res?.data) setAnnouncements(res.data);
    } catch (err) {
      console.warn('Failed to refresh announcements:', err.message);
    }
  };

  const refreshDocuments = async () => {
    try {
      const res = await documentService.getAll();
      if (res?.data) setDocuments(res.data);
    } catch (err) {
      console.warn('Failed to refresh documents:', err.message);
    }
  };

  return (
    <DataContext.Provider value={{ 
      employees, 
      attendance, 
      leaves, 
      tasks, 
      performance, 
      recruitmentJobs, 
      recruitmentCandidates, 
      announcements,
      setAnnouncements,
      documents,
      setDocuments,
      todaysBirthdays,
      workAnniversaries,
      loading, 
      error, 
      refreshAll,
      refreshAnnouncements,
      refreshDocuments
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
