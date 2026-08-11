import { rtdb } from '../config/db.js';
import { generateId } from '../utils/generateId.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const isValidEmail = (email) => {
  if (!email) return false;
  const normalized = normalizeEmail(email);
  if (normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
};

const listGet = async (path) => {
  const snap = await rtdb.ref(path).get();
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const RecruitmentModel = {
  findAllJobs: async () => {
    const jobs = await listGet('recruitmentJobs');
    return jobs.map((j) => {
      const sanitized = { ...j };
      if (!sanitized.slug && sanitized.title) {
        sanitized.slug = slugify(sanitized.title);
      }
      return sanitized;
    });
  },

  findJobById: async (id) => {
    if (!id) return null;
    const jobs = await RecruitmentModel.findAllJobs();
    return jobs.find((j) => String(j.id) === String(id)) || null;
  },

  findJobBySlug: async (slug) => {
    if (!slug) return null;
    const jobs = await RecruitmentModel.findAllJobs();
    const cleanSlug = slug.toLowerCase().trim();
    return jobs.find(
      (j) =>
        (j.slug && j.slug.toLowerCase() === cleanSlug) ||
        slugify(j.title) === cleanSlug ||
        String(j.id).toLowerCase() === cleanSlug
    ) || null;
  },

  checkDuplicateApplication: async (jobId, email) => {
    if (!jobId || !email || !isValidEmail(email)) return false;
    const candidates = await RecruitmentModel.findAllCandidates();
    const normalizedEmail = normalizeEmail(email);
    return candidates.some(
      (c) =>
        String(c.jobId) === String(jobId) &&
        normalizeEmail(c.email) === normalizedEmail
    );
  },

  createJob: async (jobData) => {
    const totalOpenings = Number(jobData.totalOpenings) || 5;
    const jobId = jobData.id || `JR-${Math.floor(100 + Math.random() * 900)}`;
    const jobTitle = jobData.title || 'Untitled Role';
    const jobSlug = jobData.slug || slugify(jobTitle);

    const newJob = {
      id: jobId,
      title: jobTitle,
      slug: jobSlug,
      description: jobData.description || '',
      requirements: jobData.requirements || 'Relevant experience and proficiency in target skill set.',
      department: jobData.department || 'General',
      location: jobData.location || 'Remote',
      employmentType: jobData.employmentType || jobData.type || 'Full-time',
      salary: jobData.salary || 'Competitive',
      driveFolderId: jobData.driveFolderId || null,
      applicants: 0,
      totalOpenings,
      hired: 0,
      progress: 0,
      status: jobData.status || 'Active',
      createdAt: new Date().toISOString(),
      ...jobData
    };

    await rtdb.ref(`recruitmentJobs/${jobId}`).set(newJob);
    return newJob;
  },

  updateJob: async (id, updateData) => {
    const job = await RecruitmentModel.findJobById(id);
    if (!job) return null;
    const updated = { ...job, ...updateData, updatedAt: new Date().toISOString() };
    await rtdb.ref(`recruitmentJobs/${id}`).set(updated);
    return updated;
  },

  deleteJob: async (id) => {
    const job = await RecruitmentModel.findJobById(id);
    if (!job) return false;
    await rtdb.ref(`recruitmentJobs/${id}`).remove();
    return true;
  },

  findAllCandidates: async () => {
    return await listGet('recruitmentApplicants');
  },

  createApplicant: async (applicantData) => {
    const applicantId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = applicantData.fullName || applicantData.name || 'Anonymous Applicant';

    const trimmedName = String(fullName).trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new Error('Applicant name must be between 2 and 100 characters long');
    }

    const rawEmail = applicantData.email || '';
    if (!isValidEmail(rawEmail)) {
      throw new Error(`Invalid applicant email format: ${rawEmail || '(empty)'}`);
    }
    const normalizedEmail = normalizeEmail(rawEmail);

    const newApplicant = {
      id: applicantId,
      jobId: applicantData.jobId || null,
      jobTitle: applicantData.jobTitle || '',
      fullName: trimmedName,
      name: trimmedName,
      email: normalizedEmail,
      phone: applicantData.phone || applicantData.mobileNo || '',
      qualification: applicantData.qualification || applicantData.highestQualification || 'Not Specified',
      experience: applicantData.experience || '',
      skills: applicantData.skills || '',
      location: applicantData.location || applicantData.currentLocation || 'Remote',
      portfolio: applicantData.portfolio || '',
      linkedin: applicantData.linkedin || '',
      github: applicantData.github || '',
      coverLetter: applicantData.coverLetter || applicantData.resumeSummary || '',
      resumeFileId: applicantData.resumeFileId || '',
      resumeLink: applicantData.resumeLink || '',
      appliedAt: applicantData.appliedAt || new Date().toISOString(),
      status: applicantData.status || applicantData.stage || 'Applied',
      stage: applicantData.stage || applicantData.status || 'Applied',
      matchScore: Math.floor(75 + Math.random() * 23)
    };

    await rtdb.ref(`recruitmentApplicants/${applicantId}`).set(newApplicant);

    const job = await RecruitmentModel.findJobById(applicantData.jobId);
    if (job) {
      await rtdb.ref(`recruitmentJobs/${job.id}/applicants`).set((job.applicants || 0) + 1);
    }

    return newApplicant;
  },

  updateCandidateStage: async (candidateId, newStage) => {
    const all = await listGet('recruitmentApplicants');
    const candidate = all.find((c) => String(c.id) === String(candidateId));
    if (!candidate) return null;

    const oldStage = candidate.stage || candidate.status;
    const updated = {
      ...candidate,
      stage: newStage,
      status: newStage,
      updatedAt: new Date().toISOString()
    };
    await rtdb.ref(`recruitmentApplicants/${candidateId}`).set(updated);

    if (newStage === 'Hired' && oldStage !== 'Hired') {
      const employees = await listGet('employees');
      const candidateEmail = normalizeEmail(candidate.email);
      const isAlreadyEmp = employees.some(
        (e) => normalizeEmail(e.email) === candidateEmail || (candidate.fullName && e.name === candidate.fullName)
      );
      if (!isAlreadyEmp) {
        const empId = generateId();
        const derivedEmail = isValidEmail(candidateEmail)
          ? candidateEmail
          : `${(candidate.fullName || candidate.name || 'employee').toLowerCase().replace(/\s+/g, '.')}@company.com`;
        const newEmployee = {
          id: empId,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: candidate.fullName || candidate.name,
          email: derivedEmail,
          role: candidate.role || 'Staff Member',
          department: 'Operations',
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        await rtdb.ref(`employees/${empId}`).set(newEmployee);
      }
    }

    return updated;
  },

  deleteApplicant: async (candidateId) => {
    const all = await listGet('recruitmentApplicants');
    const candidate = all.find((c) => String(c.id) === String(candidateId));
    if (!candidate) return null;
    await rtdb.ref(`recruitmentApplicants/${candidateId}`).remove();
    return candidate;
  }
};
