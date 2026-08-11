import { connectDatabase } from './config/db.js';
import { DepartmentModel } from './models/Department.js';
import { TeamModel } from './models/Department.js';
import { EmployeeModel } from './models/Employee.js';

const seed = async () => {
  await connectDatabase();

  console.log('Seeding initial organization data...\n');

  const departments = [
    { name: 'Engineering', description: 'Software development and technical infrastructure', location: 'San Francisco', color: '#3b82f6' },
    { name: 'Product', description: 'Product strategy, design, and management', location: 'New York', color: '#8b5cf6' },
    { name: 'Design', description: 'UX, UI, and brand design', location: 'London', color: '#ec4899' },
    { name: 'Human Resources', description: 'People operations, culture, and talent', location: 'Singapore', color: '#10b981' },
    { name: 'Legal', description: 'Legal compliance and contracts', location: 'Bangalore', color: '#f59e0b' },
  ];

  const createdDepts = [];
  for (const dept of departments) {
    try {
      const d = await DepartmentModel.create(dept);
      createdDepts.push(d);
      console.log(`  [OK] Department: ${d.name} (${d.id})`);
    } catch (err) {
      console.log(`  [SKIP] Department: ${dept.name} - ${err.message}`);
    }
  }

  const deptMap = {};
  createdDepts.forEach((d) => { deptMap[d.name] = d.id; });

  const teams = [
    { name: 'Platform Engineering', departmentId: '', description: 'Core platform and infrastructure team' },
    { name: 'Frontend', departmentId: '', description: 'Client-side web and mobile development' },
    { name: 'Backend', departmentId: '', description: 'API, microservices, and data layer' },
    { name: 'Product Management', departmentId: '', description: 'Product roadmap and feature ownership' },
    { name: 'UX Research', departmentId: '', description: 'User research and usability testing' },
    { name: 'Visual Design', departmentId: '', description: 'Brand, visual systems, and illustrations' },
    { name: 'Talent Acquisition', departmentId: '', description: 'Recruiting and employer branding' },
    { name: 'Employee Relations', departmentId: '', description: 'Engagement, retention, and culture' },
    { name: 'Compliance', departmentId: '', description: 'Legal compliance and risk management' },
  ];

  const createdTeams = [];
  for (const team of teams) {
    const deptName = Object.keys(deptMap).find((name) => {
      const dept = createdDepts.find((d) => d.id === deptMap[name]);
      if (!dept) return false;
      if (name === 'Engineering' && (team.name === 'Platform Engineering' || team.name === 'Frontend' || team.name === 'Backend')) return true;
      if (name === 'Product' && (team.name === 'Product Management' || team.name === 'UX Research')) return true;
      if (name === 'Design' && (team.name === 'Visual Design')) return true;
      if (name === 'Human Resources' && (team.name === 'Talent Acquisition' || team.name === 'Employee Relations')) return true;
      if (name === 'Legal' && (team.name === 'Compliance')) return true;
      return false;
    });

    if (!deptName) continue;

    try {
      const t = await TeamModel.create({
        ...team,
        departmentId: deptMap[deptName]
      });
      createdTeams.push(t);
      console.log(`  [OK] Team: ${t.name} -> ${deptName} (${t.id})`);
    } catch (err) {
      console.log(`  [SKIP] Team: ${team.name} - ${err.message}`);
    }
  };

  const teamMap = {};
  createdTeams.forEach((t) => { teamMap[t.name] = t.id; });

  const employees = [
    { name: 'Aiko Suzuki', email: 'aiko.suzuki@northwind.co', role: 'Legal Counsel', department: 'Legal', teamId: teamMap['Compliance'], level: 'Senior', location: 'Singapore', status: 'Active' },
    { name: 'Alex Johnson', email: 'alex.j@northwind.co', role: 'Senior Developer', department: 'Engineering', teamId: teamMap['Backend'], level: 'Senior', location: 'London', status: 'Active' },
    { name: 'Sarah Chen', email: 'sarah.c@northwind.co', role: 'Product Manager', department: 'Product', teamId: teamMap['Product Management'], level: 'Manager', location: 'New York', status: 'Active' },
    { name: 'Michael Torres', email: 'm.torres@northwind.co', role: 'UX Designer', department: 'Design', teamId: teamMap['UX Research'], level: 'Senior', location: 'San Francisco', status: 'Active' },
    { name: 'Emily Davis', email: 'emily.d@northwind.co', role: 'HR Specialist', department: 'Human Resources', teamId: teamMap['Employee Relations'], level: 'Individual', location: 'Bangalore', status: 'Active' },
  ];

  for (const emp of employees) {
    try {
      const e = await EmployeeModel.create(emp);
      console.log(`  [OK] Employee: ${e.name} (${e.id})`);
    } catch (err) {
      console.log(`  [SKIP] Employee: ${emp.name} - ${err.message}`);
    }
  }

  console.log('\nSeeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
