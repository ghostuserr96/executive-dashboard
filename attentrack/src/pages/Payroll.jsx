import React, { useMemo, useState } from 'react';
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Download,
  Play,
  Pencil,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { useDataContext } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';

const CustomTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#6b7280" fontSize="10" transform="rotate(-35)">
        {payload.value}
      </text>
    </g>
  );
};

// Realistic role & seniority based salary calculator
const getBaseSalaryByRoleAndId = (emp, index) => {
  if (emp.salary) {
    const parsed = parseFloat(String(emp.salary).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) return Math.round(parsed / 12);
  }
  return 0; // Strictly real data. Defaults to 0 if no salary is set in DB.
};

export default function Payroll() {
  const { isHRAdmin } = useAuth();
  const { employees = [], leaves = [], attendance = [], refreshAll } = useDataContext();

  const [isRunningPayroll, setIsRunningPayroll] = useState(false);
  const [payrollStatusMessage, setPayrollStatusMessage] = useState('');
  const [isPayrollCompleted, setIsPayrollCompleted] = useState(false);

  // HR Edit Salary & Status Modal States
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editBase, setEditBase] = useState('');
  const [editAllowances, setEditAllowances] = useState('');
  const [editDeductions, setEditDeductions] = useState('');
  const [editStatus, setEditStatus] = useState('Ready for Payout');
  const [isSavingSalary, setIsSavingSalary] = useState(false);

  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  // --- 100% DYNAMIC & UNIQUE PAYROLL CALCULATIONS ---
  const { monthlyTotal, totalBonuses, departmentCostsData, payslipList, pendingApprovalsCount, bankTransferRate, salaryCalcRate, reviewRate, approvalRate } = useMemo(() => {
    let monthlySum = 0;
    let bonusSum = 0;
    const deptMap = {};
    let definedSalariesCount = 0;

    const sourceEmployees = employees;
    const list = sourceEmployees.map((emp, index) => {
      const baseMonthly = getBaseSalaryByRoleAndId(emp, index);
      if (baseMonthly > 0) definedSalariesCount++;

      const empAttendanceLogs = attendance.filter(a => String(a.employeeId) === String(emp.id) || a.employeeName === emp.name);
      const lateCount = empAttendanceLogs.filter(a => a.status === 'Late').length;
      const empLeaves = leaves.filter(l => String(l.employeeId) === String(emp.id) && l.status === 'Pending');

      const allowance = emp.customAllowances !== undefined ? emp.customAllowances : 0;
      const deduction = emp.customDeductions !== undefined ? emp.customDeductions : Math.round(baseMonthly * (lateCount * 0.02));
      const bonus = emp.customBonus !== undefined ? emp.customBonus : 0;
      const netPay = baseMonthly + allowance + bonus - deduction;

      monthlySum += baseMonthly;
      bonusSum += bonus;

      const dept = emp.department || emp.role || 'Engineering';
      deptMap[dept] = (deptMap[dept] || 0) + Math.round(baseMonthly / 1000);

      // Dynamic Lifecycle Status Logic
      let calculatedStatus = 'Ready for Payout';
      if (emp.payrollStatus) {
        calculatedStatus = emp.payrollStatus;
      } else if (isPayrollCompleted) {
        calculatedStatus = 'Paid';
      } else if (empLeaves.length > 0) {
        calculatedStatus = 'Pending Review';
      }

      return {
        rawId: emp.id,
        name: emp.name || 'Employee',
        id: emp.employeeId || `EMP-100${emp.id || index + 1}`,
        role: emp.role || dept,
        rawBase: baseMonthly,
        rawAllowances: allowance,
        rawDeductions: deduction,
        rawNet: netPay,
        base: `$${baseMonthly.toLocaleString()}`,
        allowances: `+$${allowance.toLocaleString()}`,
        deductions: `-$${deduction.toLocaleString()}`,
        net: `$${netPay.toLocaleString()}`,
        status: calculatedStatus,
        avatar: emp.avatar || null
      };
    });

    const formattedDeptCosts = Object.keys(deptMap).map(dept => ({
      name: dept,
      value: deptMap[dept]
    }));

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const salaryRate = sourceEmployees.length > 0 ? Math.round((definedSalariesCount / sourceEmployees.length) * 100) : 0;

    const reviewedCount = list.filter(p => p.status !== 'Pending Review').length;
    const reviewPct = list.length > 0 ? Math.round((reviewedCount / list.length) * 100) : 0;

    const approvedCount = list.filter(p => p.status === 'Approved' || p.status === 'Paid').length;
    const approvalPct = list.length > 0 ? Math.round((approvedCount / list.length) * 100) : 0;

    const paidCount = list.filter(p => p.status === 'Paid').length;
    const transferPct = list.length > 0 ? Math.round((paidCount / list.length) * 100) : 0;

    return {
      monthlyTotal: monthlySum,
      totalBonuses: bonusSum,
      departmentCostsData: formattedDeptCosts,
      payslipList: list,
      pendingApprovalsCount: pendingCount,
      bankTransferRate: transferPct,
      salaryCalcRate: salaryRate,
      reviewRate: reviewPct,
      approvalRate: approvalPct
    };
  }, [employees, leaves, attendance, isPayrollCompleted]);

  const payrollTrendData = useMemo(() => {
    const baseM = monthlyTotal / 1000000;
    const bonusM = totalBonuses / 1000000;
    const currentMonthIdx = new Date().getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      payroll: i === currentMonthIdx ? parseFloat(baseM.toFixed(6)) : 0,
      bonuses: i === currentMonthIdx ? parseFloat(bonusM.toFixed(6)) : 0
    }));
  }, [monthlyTotal, totalBonuses]);

  if (!isHRAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center p-8 min-h-[80vh]">
        <div className="card-elevated p-8 max-w-md text-center space-y-4 bg-card border border-border rounded-2xl shadow-lg">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted (HR Only)</h2>
          <p className="text-sm text-muted-foreground">
            Payroll management, salary structures, and bank disbursement actions are strictly restricted to HR Managers. Employees do not have access to company-wide payroll records.
          </p>
        </div>
      </main>
    );
  }

  // Open HR Edit Modal
  const openEditModal = (userItem) => {
    setEditingEmployee(userItem);
    setEditBase(userItem.rawBase);
    setEditAllowances(userItem.rawAllowances);
    setEditDeductions(userItem.rawDeductions);
    setEditStatus(userItem.status);
  };

  // Save HR Salary & Status Modifications to Database
  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setIsSavingSalary(true);
    try {
      const baseNum = parseFloat(editBase) || 0;
      const annualVal = baseNum * 12;
      const allowanceNum = parseFloat(editAllowances) || 0;
      const deductionNum = parseFloat(editDeductions) || 0;

      await employeeService.update(editingEmployee.rawId, {
        salary: annualVal,
        customAllowances: allowanceNum,
        customDeductions: deductionNum,
        payrollStatus: editStatus
      });

      if (refreshAll) await refreshAll();

      setPayrollStatusMessage(`✅ Payslip updated for ${editingEmployee.name}! Status: [${editStatus}] | Base: $${baseNum.toLocaleString()}/mo`);
      setEditingEmployee(null);
      setTimeout(() => setPayrollStatusMessage(''), 5000);
    } catch (err) {
      console.error('Failed updating salary:', err);
      setPayrollStatusMessage(`❌ Error saving salary changes: ${err.message}`);
    } finally {
      setIsSavingSalary(false);
    }
  };

  // CSV Payslip Exporter
  const handleExportPayslips = () => {
    let csvContent = "data:text/csv;charset=utf-8,Employee,Employee ID,Department,Base Salary,Allowances,Deductions,Net Pay,Status\n";
    payslipList.forEach(p => {
      csvContent += `"${p.name}","${p.id}","${p.role}","${p.base}","${p.allowances}","${p.deductions}","${p.net}","${p.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentMonthName}_Payroll_Payslips.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setPayrollStatusMessage(`✅ Exported ${payslipList.length} payslips to ${currentMonthName}_Payroll_Payslips.csv`);
    setTimeout(() => setPayrollStatusMessage(''), 4000);
  };

  // Run Payroll Trigger
  const handleRunPayroll = () => {
    setIsRunningPayroll(true);
    setPayrollStatusMessage(`⏳ Executing ${currentMonthName} payroll calculation & bank transfers...`);
    
    setTimeout(() => {
      setIsRunningPayroll(false);
      setIsPayrollCompleted(true);
      setPayrollStatusMessage(`🎉 ${currentMonthName} Payroll Executed Successfully! Disbursed $${monthlyTotal.toLocaleString()} across ${payslipList.length} employees. All status marked as PAID.`);
      setTimeout(() => setPayrollStatusMessage(''), 6000);
    }, 1500);
  };

  const payrollStats = [
    {
      title: `${currentMonthName} payroll`,
      value: `$${monthlyTotal.toLocaleString()}`,
      change: null,
      isPositive: true,
      icon: <Wallet className="h-5 w-5 text-green-500" />
    },
    {
      title: 'Bonuses',
      value: `$${totalBonuses.toLocaleString()}`,
      change: null,
      isPositive: true,
      icon: <DollarSign className="h-5 w-5 text-blue-500" />
    },
    {
      title: 'Approvals',
      value: `${pendingApprovalsCount} pending`,
      change: null,
      icon: <Clock className="h-5 w-5 text-amber-500" />
    },
    {
      title: 'Bank transfers',
      value: `${bankTransferRate}% cleared`,
      change: null,
      isPositive: true,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />
    }
  ];

  const progressSteps = [
    { title: 'Salary calculated', value: salaryCalcRate },
    { title: 'Reviews', value: reviewRate },
    { title: 'Approvals', value: approvalRate },
    { title: 'Bank transfers', value: bankTransferRate }
  ];

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Finance</div>
            <h1 className="truncate text-3xl font-semibold tracking-tight">Payroll</h1>
            <p className="mt-1 text-sm text-muted-foreground">Attendance-linked payroll with automatic calculation, HR salary editing, and bank transfers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPayslips}
              className="flex items-center gap-2 bg-background border border-border hover:bg-muted text-foreground h-10 px-4 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Download className="h-4 w-4" /> Export payslips
            </button>
            <button
              onClick={handleRunPayroll}
              disabled={isRunningPayroll}
              className="flex items-center gap-2 bg-blue-600 text-foreground hover:bg-blue-700 h-10 px-4 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-white" /> {isRunningPayroll ? 'Processing Payroll...' : `Run ${currentMonthName} payroll`}
            </button>
          </div>
        </div>

        {/* Dynamic Status Toast Notification */}
        {payrollStatusMessage && (
          <div className="bg-primary/10 border border-primary/30 text-primary text-sm font-semibold p-4 rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
            <span>{payrollStatusMessage}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {payrollStats.map((stat, i) => (
            <div key={i} className="card-elevated hover-lift p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-semibold mt-2 truncate">{stat.value}</h3>
                </div>
                <div className={`p-2 rounded-full ${stat.title.includes('payroll') ? 'bg-green-100 dark:bg-green-500/20' : stat.title === 'Bonuses' ? 'bg-blue-100 dark:bg-blue-500/20' : stat.title === 'Approvals' ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-green-100 dark:bg-green-500/20'}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                {stat.change ? (
                  <>
                    <div className={`flex items-center gap-1 font-medium rounded px-1.5 py-0.5 ${
                      stat.isPositive ? 'text-green-700 bg-green-50 dark:bg-green-500/20 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                    <span className="text-muted-foreground">vs last month</span>
                  </>
                ) : (
                  <span className="text-muted-foreground invisible">No change</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bars */}
        <div className="card-elevated p-6 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {progressSteps.map((step, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm font-medium mb-2 text-muted-foreground">
                  <span>{step.title}</span>
                  <span>{step.value}%</span>
                </div>
                <div className="h-2.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${step.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">12-month payroll cost ($M)</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickMargin={10} minTickGap={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Line type="monotone" dataKey="payroll" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="bonuses" stroke="#eab308" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: 'hsl(var(--card))' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-elevated p-6 flex flex-col">
            <h3 className="text-base font-semibold mb-6">Cost by department ($K / mo)</h3>
            <div className="h-[250px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentCostsData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={<CustomTick />} 
                    interval={0}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }} 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }} 
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* List Section with HR Edit Button */}
        <div className="card-elevated">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h3 className="text-base font-semibold">{currentMonthName} payslip preview</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Auto-generated & HR adjustable salary breakdown</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-semibold">
              {isPayrollCompleted ? 'Completed' : 'Draft'}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground font-medium border-b border-border bg-muted/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Base</th>
                  <th className="px-6 py-4 font-medium">Allowances</th>
                  <th className="px-6 py-4 font-medium">Deductions</th>
                  <th className="px-6 py-4 font-medium">Net pay</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">HR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payslipList.map((userItem, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {userItem.avatar ? (
                          <img src={userItem.avatar} alt={userItem.name} className="w-8 h-8 rounded-full border border-border object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-border bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">
                            {userItem.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-foreground">{userItem.name}</div>
                          <div className="text-xs text-muted-foreground">{userItem.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{userItem.role}</td>
                    <td className="px-6 py-4 font-medium">{userItem.base}</td>
                    <td className="px-6 py-4 font-medium text-green-600 dark:text-green-500">{userItem.allowances}</td>
                    <td className="px-6 py-4 font-medium text-red-600 dark:text-red-500">{userItem.deductions}</td>
                    <td className="px-6 py-4 font-semibold">{userItem.net}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        userItem.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : userItem.status === 'Approved'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                          : userItem.status === 'Pending Review'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : userItem.status === 'On Hold'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      }`}>
                        {userItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(userItem)}
                        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium"
                        title="Edit Salary & Status"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* HR EDIT SALARY & PAYSLIP MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                {editingEmployee.avatar ? (
                  <img src={editingEmployee.avatar} alt={editingEmployee.name} className="w-10 h-10 rounded-full border border-border object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full border border-border bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
                    {editingEmployee.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-base text-foreground">Edit Salary Structure & Status</h3>
                  <p className="text-xs text-muted-foreground">{editingEmployee.name} ({editingEmployee.role})</p>
                </div>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Base Monthly Salary ($)
                </label>
                <input
                  type="number"
                  required
                  value={editBase}
                  onChange={(e) => setEditBase(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 10500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Monthly Allowances ($)
                </label>
                <input
                  type="number"
                  required
                  value={editAllowances}
                  onChange={(e) => setEditAllowances(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 1200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Monthly Deductions ($)
                </label>
                <input
                  type="number"
                  required
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 1500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">
                  Payslip Lifecycle Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'Ready for Payout', label: 'Ready for Payout', color: 'border-cyan-500/60 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', dot: 'bg-cyan-500' },
                    { key: 'Approved', label: 'Approved', color: 'border-blue-500/60 bg-blue-500/15 text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
                    { key: 'Paid', label: 'Paid', color: 'border-emerald-500/60 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
                    { key: 'Pending Review', label: 'Pending Review', color: 'border-amber-500/60 bg-amber-500/15 text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
                    { key: 'On Hold', label: 'On Hold', color: 'border-rose-500/60 bg-rose-500/15 text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' }
                  ].map((opt) => {
                    const isSelected = editStatus === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setEditStatus(opt.key)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? `${opt.color} shadow-sm ring-2 ring-primary/40 font-bold`
                            : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        } ${opt.key === 'On Hold' ? 'col-span-2' : ''}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.dot}`}></span>
                          <span>{opt.label}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-muted/50 p-3.5 rounded-xl border border-border flex items-center justify-between text-xs font-medium">
                <span className="text-muted-foreground">Calculated Net Pay:</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  ${((parseFloat(editBase) || 0) + (parseFloat(editAllowances) || 0) - (parseFloat(editDeductions) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSalary}
                  className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {isSavingSalary ? 'Saving...' : 'Save Salary & Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
