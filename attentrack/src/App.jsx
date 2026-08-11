import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CandidateApply from './pages/CandidateApply';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Leave from './pages/Leave';
import Performance from './pages/Performance';
import Recruitment from './pages/Recruitment';
import Learning from './pages/Learning';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import AiCopilot from './pages/AiCopilot';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import Organization from './pages/Organization';
import Messaging from './pages/Messaging';
import Settings from './pages/Settings';
import AiResumeScreening from './pages/AiResumeScreening';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth & Application Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/apply" element={<CandidateApply />} />
              <Route path="/apply/:jobSlug" element={<CandidateApply />} />

              {/* Protected App Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="payroll" element={<Payroll />} />
                  <Route path="leave" element={<Leave />} />
                  <Route path="performance" element={<Performance />} />
                  <Route path="recruitment" element={<Recruitment />} />
                  <Route path="ai-resume-screening" element={<AiResumeScreening />} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="ai-insights" element={<AiCopilot />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="organization" element={<Organization />} />
                  <Route path="messaging" element={<Messaging />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
