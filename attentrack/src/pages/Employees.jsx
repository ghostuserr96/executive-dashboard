import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Filter, Users, Mail, MapPin, Phone, Download, Plus, ChevronDown, SlidersHorizontal, LayoutGrid, List, Trash2, X, CheckCircle2, Building, Upload, Camera, Image as ImageIcon, Loader2, Pencil } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { employeeService } from '../services/employeeService';
import { organizationService } from '../services/organizationService';
import { uploadService } from '../services/uploadService';
import { CustomSelect } from '../components/common/CustomSelect';

export default function Employees() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { employees: contextEmployees, refreshAll } = useDataContext();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery) {
      setSearchTerm(urlQuery);
    }
  }, [searchParams]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemographicsOpen, setIsDemographicsOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const LEVELS = ['C-Level', 'VP', 'Director', 'Manager', 'Lead', 'Senior', 'Individual'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    teamId: '',
    managerId: '',
    level: 'Individual',
    location: 'Remote',
    phone: '',
    skills: '',
    avatar: '',
    dob: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    age: '',
    distanceFromHome: '',
    dailyRate: '',
    hourlyRate: '',
    monthlyIncome: '',
    monthlyRate: '',
    percentSalaryHike: '',
    stockOptionLevel: 0,
    education: 3,
    educationField: 'Life Sciences',
    maritalStatus: 'Single',
    gender: 'Male',
    jobLevel: 1,
    numCompaniesWorked: 1,
    trainingTimesLastYear: 2,
    environmentSatisfaction: 3,
    relationshipSatisfaction: 3,
    jobSatisfaction: 3,
    jobInvolvement: 3,
    workLifeBalance: 3,
    performanceRating: 3,
    overTime: 'No',
    businessTravel: 'Travel_Rarely'
  });

  useEffect(() => {
    const loadOrgData = async () => {
      try {
        const [deptRes, teamRes] = await Promise.allSettled([
          organizationService.getAllDepartments(),
          organizationService.getAllTeams()
        ]);
        if (deptRes.status === 'fulfilled' && deptRes.value?.data) {
          setDepartments(deptRes.value.data);
        }
        if (teamRes.status === 'fulfilled' && teamRes.value?.data) {
          setTeams(teamRes.value.data);
        }
      } catch (e) {
        console.warn('Failed to load org data for employee form', e);
      }
    };
    loadOrgData();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setUploadError('');
    try {
      const res = await uploadService.uploadFile(file, 'attentrack/employees');
      if (res && res.url) {
        setFormData(prev => ({ ...prev, avatar: res.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Failed to upload photo to Cloudinary');
    } finally {
      setIsUploadingPhoto(false);
    }
  };


  const employeesList = Array.isArray(contextEmployees) ? contextEmployees : [];

  const filteredEmployees = employeesList.filter((emp) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q) ||
      (emp.location && emp.location.toLowerCase().includes(q));
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setEditingEmployeeId(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      teamId: '',
      managerId: '',
      level: 'Individual',
      location: 'Remote',
      phone: '',
      skills: '',
      avatar: '',
      dob: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      age: '',
      distanceFromHome: '',
      dailyRate: '',
      hourlyRate: '',
      monthlyIncome: '',
      monthlyRate: '',
      percentSalaryHike: '',
      stockOptionLevel: 0,
      education: 3,
      educationField: 'Life Sciences',
      maritalStatus: 'Single',
      gender: 'Male',
      jobLevel: 1,
      numCompaniesWorked: 1,
      trainingTimesLastYear: 2,
      environmentSatisfaction: 3,
      relationshipSatisfaction: 3,
      jobSatisfaction: 3,
      jobInvolvement: 3,
      workLifeBalance: 3,
      performanceRating: 3,
      overTime: 'No',
      businessTravel: 'Travel_Rarely'
    });
    setUploadError('');
    setIsDemographicsOpen(false);
    setIsAddModalOpen(true);
  };

  const location = useLocation();
  useEffect(() => {
    if (location.state?.autoOpenQuickAdd) {
      handleOpenAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOpenEditModal = (emp) => {
    setEditingEmployeeId(emp.id);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || '',
      department: emp.department || '',
      teamId: emp.teamId || '',
      managerId: emp.managerId || '',
      level: emp.level || 'Individual',
      location: emp.location || 'Remote',
      phone: emp.phone || '',
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : (emp.skills || ''),
      avatar: emp.avatar || '',
      dob: emp.dob || '',
      joinDate: emp.joinDate || '',
      status: emp.status || 'Active',
      age: emp.age || '',
      distanceFromHome: emp.distanceFromHome || '',
      dailyRate: emp.dailyRate || '',
      hourlyRate: emp.hourlyRate || '',
      monthlyIncome: emp.monthlyIncome || '',
      monthlyRate: emp.monthlyRate || '',
      percentSalaryHike: emp.percentSalaryHike || '',
      stockOptionLevel: emp.stockOptionLevel !== undefined ? emp.stockOptionLevel : 0,
      education: emp.education || 3,
      educationField: emp.educationField || 'Life Sciences',
      maritalStatus: emp.maritalStatus || 'Single',
      gender: emp.gender || 'Male',
      jobLevel: emp.jobLevel || 1,
      numCompaniesWorked: emp.numCompaniesWorked || 1,
      trainingTimesLastYear: emp.trainingTimesLastYear || 2,
      environmentSatisfaction: emp.environmentSatisfaction || 3,
      relationshipSatisfaction: emp.relationshipSatisfaction || 3,
      jobSatisfaction: emp.jobSatisfaction || 3,
      jobInvolvement: emp.jobInvolvement || 3,
      workLifeBalance: emp.workLifeBalance || 3,
      performanceRating: emp.performanceRating || 3,
      overTime: emp.overTime || 'No',
      businessTravel: emp.businessTravel || 'Travel_Rarely'
    });
    setUploadError('');
    setIsDemographicsOpen(false);
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const skillsArray = typeof formData.skills === 'string'
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.skills;

      const payload = {
        ...formData,
        skills: skillsArray,
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3b82f6&color=fff&bold=true`,
        initials: formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        dob: formData.dob || null,
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        teamId: formData.teamId || null,
        managerId: formData.managerId || null,
        level: formData.level || 'Individual'
      };

      if (editingEmployeeId) {
        await employeeService.update(editingEmployeeId, payload);
        setSuccessMsg('Employee profile updated successfully!');
      } else {
        await employeeService.create(payload);
        setSuccessMsg('New employee added successfully!');
      }

      await refreshAll();
      setIsAddModalOpen(false);
      setEditingEmployeeId(null);
      setTimeout(() => setSuccessMsg(''), 4000);
      setFormData({
        name: '',
        email: '',
        role: '',
        department: '',
        teamId: '',
        managerId: '',
        level: 'Individual',
        location: 'Remote',
        phone: '',
        skills: '',
        avatar: '',
        dob: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        age: '',
        distanceFromHome: '',
        dailyRate: '',
        hourlyRate: '',
        monthlyIncome: '',
        monthlyRate: '',
        percentSalaryHike: '',
        stockOptionLevel: 0,
        education: 3,
        educationField: 'Life Sciences',
        maritalStatus: 'Single',
        gender: 'Male',
        jobLevel: 1,
        numCompaniesWorked: 1,
        trainingTimesLastYear: 2,
        environmentSatisfaction: 3,
        relationshipSatisfaction: 3,
        jobSatisfaction: 3,
        jobInvolvement: 3,
        workLifeBalance: 3,
        performanceRating: 3,
        overTime: 'No',
        businessTravel: 'Travel_Rarely'
      });
    } catch (err) {
      alert('Failed saving employee: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee record?')) {
      try {
        await employeeService.delete(id);
        await refreshAll();
      } catch (err) {
        alert('Failed deleting employee: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Name', 'Role', 'Department', 'Email', 'Location', 'Status'],
      ...filteredEmployees.map(e => [e.id, e.name, e.role, e.department, e.email, e.location, e.status])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', `data:text/csv;charset=utf-8,${encodedUri}`);
    link.setAttribute('download', `attentrack_employees_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departmentsList = ['All', ...departments.map(d => d.name)];
  const deptOptions = departments.map(d => ({ label: d.name, value: d.name }));
  const teamOptions = teams.map(t => ({ label: `${t.name} (${t.department?.name || ''})`, value: t.id }));
  const managerOptions = employeesList
    .filter(e => e.id !== editingEmployeeId)
    .map(e => ({ label: `${e.name} - ${e.role}`, value: e.id }));

  return (
    <main className="flex-1 min-w-0 overflow-y-auto">
      <div className="mx-auto max-w-[1600px] p-4 lg:p-8 space-y-6 animate-fade-in">
        {successMsg && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-start justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-primary uppercase mb-1">People</div>
            <h1 className="text-2xl font-semibold tracking-tight">Employee Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">Every teammate, one search away. Filter by department, role, location and more.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-xl gap-2 cursor-pointer shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export Directory
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-xl gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: employeesList.length },
            { label: 'Active', value: employeesList.filter(e => e.status === 'Active').length },
            { label: 'Departments', value: new Set(employeesList.map(e => e.department).filter(Boolean)).size },
            { label: 'Locations', value: new Set(employeesList.map(e => e.location).filter(Boolean)).size }
          ].map((metric, i) => (
            <div key={i} className="card-elevated p-4 flex flex-col justify-center gap-1">
              <span className="text-[13px] text-muted-foreground font-medium">{metric.label}</span>
              <span className="text-2xl font-semibold tracking-tight">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="card-elevated p-2 flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full flex items-center pl-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or role..."
              className="flex h-9 w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 border-0"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 min-w-[170px]">
            <CustomSelect
              options={deptOptions}
              value={selectedDept}
              onChange={setSelectedDept}
            />

            <div className="inline-flex items-center justify-center rounded-lg bg-secondary/50 p-1 h-9">
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all h-7 gap-2 cursor-pointer ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all h-7 gap-2 cursor-pointer ${viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <List className="h-4 w-4" />
                Table
              </button>
            </div>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="card-elevated p-12 text-center border border-dashed border-border rounded-2xl">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg text-foreground mb-1">
              {searchTerm || selectedDept !== 'All' ? 'No matching employees' : 'No employees yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {searchTerm || selectedDept !== 'All'
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first teammate to start building your company directory.'}
            </p>
            {!searchTerm && selectedDept === 'All' && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground h-9 px-5 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add First Employee
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="card-elevated hover-lift overflow-hidden relative group">
                <div className="h-16 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                <div className="px-4 pb-4 -mt-8">
                  <div className="flex items-end justify-between">
                    <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-card bg-background">
                      {emp.avatar ? (
                        <img className="aspect-square h-full w-full object-cover" src={emp.avatar} alt={emp.name} />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-muted font-bold">{emp.initials || 'EM'}</span>
                      )}
                    </span>
                    <div className={`inline-flex items-center border font-semibold border-0 rounded-md text-[10px] px-2 py-0.5 ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {emp.status || 'Active'}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold truncate text-foreground">{emp.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{emp.role} · {emp.department}</div>
                  </div>
                  <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {emp.location || 'Remote'}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="inline-flex items-center justify-center gap-1.5 font-medium border border-input bg-background shadow-sm hover:bg-accent h-8 px-3 flex-1 rounded-lg text-xs cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="inline-flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-input h-8 w-8 rounded-lg transition-colors cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                      <img src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=3b82f6&color=fff&bold=true`} alt="" className="w-8 h-8 rounded-full bg-secondary object-cover" />
                      <div>
                        <div>{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{emp.role}</td>
                    <td className="px-4 py-3">{emp.department}</td>
                    <td className="px-4 py-3">{emp.location || 'Remote'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenEditModal(emp)} className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/10" title="Edit Employee">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10" title="Delete Employee">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {editingEmployeeId ? 'Edit Employee Profile' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                {editingEmployeeId ? 'Update employee photo and personal details.' : 'Enter official teammate details to register them in the system.'}
              </p>

              <form onSubmit={handleSaveEmployee} className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-background/60 border border-border rounded-xl">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Employee Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-foreground mb-1">Employee Photo</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-xs font-medium text-secondary-foreground rounded-lg transition-colors border border-border cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {formData.avatar ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {formData.avatar && (
                        <span className="text-[10px] font-semibold tracking-wide text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Photo Uploaded
                        </span>
                      )}
                    </div>
                    {uploadError && <p className="text-[11px] text-rose-400 mt-1">{uploadError}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. Frontend Lead"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Department</label>
                    <CustomSelect
                      value={formData.department}
                      onChange={(val) => setFormData({ ...formData, department: val })}
                      options={deptOptions}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Team</label>
                    <CustomSelect
                      value={formData.teamId}
                      onChange={(val) => setFormData({ ...formData, teamId: val })}
                      options={[{ label: 'Select team', value: '' }, ...teamOptions]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Reports To (Manager)</label>
                    <CustomSelect
                      value={formData.managerId}
                      onChange={(val) => setFormData({ ...formData, managerId: val })}
                      options={[{ label: 'None', value: '' }, ...managerOptions]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Level</label>
                    <CustomSelect
                      value={formData.level}
                      onChange={(val) => setFormData({ ...formData, level: val })}
                      options={LEVELS.map(l => ({ label: l, value: l }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                    <CustomSelect
                      value={formData.status}
                      onChange={(val) => setFormData({ ...formData, status: val })}
                      options={[
                        { label: 'Active', value: 'Active' },
                        { label: 'Inactive', value: 'Inactive' },
                        { label: 'On Leave', value: 'On Leave' },
                        { label: 'Terminated', value: 'Terminated' }
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="React, TypeScript, GraphQL"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 555 000 0000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Birthday</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Work Anniversary (Join Date)</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={() => setIsDemographicsOpen(!isDemographicsOpen)}
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-secondary/50 hover:bg-secondary text-left transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">Demographics & Compensation</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Manage advanced HR and financial data</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isDemographicsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDemographicsOpen && (
                    <div className="mt-4 space-y-4 p-4 border border-border rounded-xl bg-background">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Age</label>
                          <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Distance From Home (mi)</label>
                          <input type="number" value={formData.distanceFromHome} onChange={(e) => setFormData({ ...formData, distanceFromHome: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Daily Rate (₹)</label>
                          <input type="number" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Hourly Rate (₹)</label>
                          <input type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Monthly Income (₹)</label>
                          <input type="number" value={formData.monthlyIncome} onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Monthly Rate (₹)</label>
                          <input type="number" value={formData.monthlyRate} onChange={(e) => setFormData({ ...formData, monthlyRate: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Salary Hike (%)</label>
                          <input type="number" value={formData.percentSalaryHike} onChange={(e) => setFormData({ ...formData, percentSalaryHike: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Stock Option Level</label>
                          <CustomSelect value={formData.stockOptionLevel} onChange={(val) => setFormData({ ...formData, stockOptionLevel: Number(val) })} options={[{label: '0 - None', value: 0},{label: '1 - Low', value: 1},{label: '2 - Medium', value: 2},{label: '3 - High', value: 3}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Education Level</label>
                          <CustomSelect value={formData.education} onChange={(val) => setFormData({ ...formData, education: Number(val) })} options={[{label: '1 - Below College', value: 1},{label: '2 - College', value: 2},{label: '3 - Bachelor', value: 3},{label: '4 - Master', value: 4},{label: '5 - Doctor', value: 5}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Education Field</label>
                          <input type="text" value={formData.educationField} onChange={(e) => setFormData({ ...formData, educationField: e.target.value })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Marital Status</label>
                          <CustomSelect value={formData.maritalStatus} onChange={(val) => setFormData({ ...formData, maritalStatus: val })} options={[{label: 'Single', value: 'Single'},{label: 'Married', value: 'Married'},{label: 'Divorced', value: 'Divorced'}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Gender</label>
                          <CustomSelect value={formData.gender} onChange={(val) => setFormData({ ...formData, gender: val })} options={[{label: 'Male', value: 'Male'},{label: 'Female', value: 'Female'}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Job Level</label>
                          <CustomSelect value={formData.jobLevel} onChange={(val) => setFormData({ ...formData, jobLevel: Number(val) })} options={[{label: '1', value: 1},{label: '2', value: 2},{label: '3', value: 3},{label: '4', value: 4},{label: '5', value: 5}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Past Companies Worked</label>
                          <input type="number" value={formData.numCompaniesWorked} onChange={(e) => setFormData({ ...formData, numCompaniesWorked: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Training Last Year</label>
                          <input type="number" value={formData.trainingTimesLastYear} onChange={(e) => setFormData({ ...formData, trainingTimesLastYear: Number(e.target.value) })} className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-foreground text-xs focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Env Satisfaction</label>
                          <CustomSelect value={formData.environmentSatisfaction} onChange={(val) => setFormData({ ...formData, environmentSatisfaction: Number(val) })} options={[{label: '1 - Low', value: 1},{label: '2 - Medium', value: 2},{label: '3 - High', value: 3},{label: '4 - Very High', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Rel Satisfaction</label>
                          <CustomSelect value={formData.relationshipSatisfaction} onChange={(val) => setFormData({ ...formData, relationshipSatisfaction: Number(val) })} options={[{label: '1 - Low', value: 1},{label: '2 - Medium', value: 2},{label: '3 - High', value: 3},{label: '4 - Very High', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Job Satisfaction</label>
                          <CustomSelect value={formData.jobSatisfaction} onChange={(val) => setFormData({ ...formData, jobSatisfaction: Number(val) })} options={[{label: '1 - Low', value: 1},{label: '2 - Medium', value: 2},{label: '3 - High', value: 3},{label: '4 - Very High', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Job Involvement</label>
                          <CustomSelect value={formData.jobInvolvement} onChange={(val) => setFormData({ ...formData, jobInvolvement: Number(val) })} options={[{label: '1 - Low', value: 1},{label: '2 - Medium', value: 2},{label: '3 - High', value: 3},{label: '4 - Very High', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Work Life Balance</label>
                          <CustomSelect value={formData.workLifeBalance} onChange={(val) => setFormData({ ...formData, workLifeBalance: Number(val) })} options={[{label: '1 - Bad', value: 1},{label: '2 - Good', value: 2},{label: '3 - Better', value: 3},{label: '4 - Best', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Performance Rating</label>
                          <CustomSelect value={formData.performanceRating} onChange={(val) => setFormData({ ...formData, performanceRating: Number(val) })} options={[{label: '1 - Low', value: 1},{label: '2 - Good', value: 2},{label: '3 - Excellent', value: 3},{label: '4 - Outstanding', value: 4}]} />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">OverTime</label>
                          <CustomSelect value={formData.overTime} onChange={(val) => setFormData({ ...formData, overTime: val })} options={[{label: 'Yes', value: 'Yes'},{label: 'No', value: 'No'}]} />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-semibold text-foreground mb-1 uppercase tracking-wider">Business Travel</label>
                          <CustomSelect value={formData.businessTravel} onChange={(val) => setFormData({ ...formData, businessTravel: val })} options={[{label: 'Non-Travel', value: 'Non-Travel'},{label: 'Travel Rarely', value: 'Travel_Rarely'},{label: 'Travel Frequently', value: 'Travel_Frequently'}]} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-border text-foreground rounded-xl text-sm hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
