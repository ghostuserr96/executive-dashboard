import { RecruitmentModel, slugify } from '../models/Recruitment.js';
import { uploadResumeToCloudinay, deleteResumeFromCloudinary } from '../services/cloudinary.js';


export const getJobs = async (req, res, next) => {
  try {
    const jobs = await RecruitmentModel.findAllJobs();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const job = await RecruitmentModel.findJobBySlug(slug);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const { title, department, description, requirements, location, employmentType, salary, totalOpenings } = req.body;
    if (!title || !department) {
      return res.status(400).json({ success: false, message: 'Job title and department are required' });
    }

    const jobSlug = req.body.slug || slugify(title);

    const newJob = await RecruitmentModel.createJob({
      ...req.body,
      slug: jobSlug,
      requirements: requirements || 'Relevant experience and proficiency in target skill set.',
      employmentType: employmentType || 'Full-time',
      salary: salary || 'Competitive'
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await RecruitmentModel.findJobById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    await RecruitmentModel.deleteJob(jobId);
    res.json({ success: true, message: 'Job posting deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await RecruitmentModel.findAllCandidates();
    res.json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    next(error);
  }
};

export const submitPublicApplication = async (req, res, next) => {
  try {
    const {
      jobId,
      slug,
      fullName,
      name,
      email,
      phone,
      mobileNo,
      qualification,
      highestQualification,
      experience,
      currentLocation,
      location,
      skills,
      portfolio,
      linkedin,
      github,
      coverLetter,
      resumeSummary,
      base64File,
      fileName,
      mimeType
    } = req.body;

    // Find job by ID or slug
    let job = null;
    if (jobId) {
      job = await RecruitmentModel.findJobById(jobId);
    }
    if (!job && slug) {
      job = await RecruitmentModel.findJobBySlug(slug);
    }
    if (!job && req.params.slug) {
      job = await RecruitmentModel.findJobBySlug(req.params.slug);
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Target job posting not found' });
    }

    const applicantName = (fullName || name || '').trim();
    const applicantEmail = (email || '').trim();
    const applicantPhone = (phone || mobileNo || '').trim();
    const applicantQual = (qualification || highestQualification || '').trim();
    const applicantExp = (experience || '').trim();
    const applicantLoc = (location || currentLocation || '').trim();
    const applicantSkills = (skills || '').trim();

    // 1. Required fields validation
    if (!applicantName || !applicantEmail || !applicantPhone || !applicantQual || !applicantExp || !applicantLoc || !applicantSkills) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Full Name, Email, Phone, Highest Qualification, Experience, Current Location, and Skills are mandatory.'
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(applicantEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // 3. Phone format validation
    const phoneRegex = /^[\+\d\s\(\)\-]{7,20}$/;
    if (!phoneRegex.test(applicantPhone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number (min 7 digits).' });
    }

    // 4. Duplicate application check for same job
    const isDuplicate = await RecruitmentModel.checkDuplicateApplication(job.id, applicantEmail);
    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: `An application with email '${applicantEmail}' has already been submitted for '${job.title}'.`
      });
    }

    // 5. Resume upload validation & processing
    if (!base64File && !req.file) {
      return res.status(400).json({ success: false, message: 'Resume document upload is required (PDF, DOC, DOCX up to 10MB).' });
    }

    let fileBuffer;
    let originalName = fileName || 'Resume.pdf';
    let fileMime = mimeType || 'application/pdf';

    if (base64File) {
      const match = base64File.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        fileMime = match[1];
        fileBuffer = Buffer.from(match[2], 'base64');
      } else {
        fileBuffer = Buffer.from(base64File, 'base64');
      }
    } else if (req.file) {
      fileBuffer = req.file.buffer;
      originalName = req.file.originalname;
      fileMime = req.file.mimetype;
    }

    // Validate File Extension (PDF, DOC, DOCX)
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume format. Only PDF, DOC, and DOCX files are allowed.'
      });
    }

    // Validate File Size (Max 10 MB = 10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileBuffer && fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'Resume file size exceeds the 10 MB limit. Please upload a smaller file.'
      });
    }

    // Format file name: "Virat Kohli.pdf"
    const sanitizedCandidateName = applicantName.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Candidate';

    // 6. Upload resume to Cloudinary (stored as resumes/virat_kohli.pdf)
    const cloudinaryResult = await uploadResumeToCloudinay(fileBuffer, sanitizedCandidateName, ext);

    // 7. Store Applicant in Firebase / Firestore
    const newApplicantData = {
      jobId: job.id,
      jobTitle: job.title,
      fullName: applicantName,
      name: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      qualification: applicantQual,
      experience: applicantExp,
      location: applicantLoc,
      skills: applicantSkills,
      portfolio: portfolio || '',
      linkedin: linkedin || '',
      github: github || '',
      coverLetter: coverLetter || resumeSummary || '',
      resumeFileId: cloudinaryResult.resumeFileId,
      resumeLink:   cloudinaryResult.resumeLink,
      status: 'Applied',
      stage: 'Applied',
      appliedAt: new Date().toISOString()
    };

    const newApplicant = await RecruitmentModel.createApplicant(newApplicantData);

    res.status(201).json({
      success: true,
      message: 'Your job application has been submitted successfully!',
      data: newApplicant
    });
  } catch (error) {
    next(error);
  }
};

export const createCandidate = async (req, res, next) => {
  try {
    const { name, fullName, role } = req.body;
    if ((!name && !fullName) || !role) {
      return res.status(400).json({ success: false, message: 'Candidate name and target role are required' });
    }
    const newCand = await RecruitmentModel.createApplicant(req.body);
    res.status(201).json({ success: true, data: newCand });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStage = async (req, res, next) => {
  try {
    const { stage, cleanResume } = req.body;
    if (!stage) return res.status(400).json({ success: false, message: 'New stage is required' });

    const updated = await RecruitmentModel.updateCandidateStage(req.params.id, stage);
    if (!updated) return res.status(404).json({ success: false, message: 'Candidate not found' });

    // Automatic Cloudinary resume cleanup when candidate process completes
    let resumeDeleted = false;
    if (cleanResume || stage === 'Hire' || stage === 'Hired' || stage === 'Reject') {
      const publicId = updated.resumeFileId;
      if (publicId) {
        console.log(`[Recruitment Controller] Process complete (${stage}). Cleaning up Cloudinary resume for '${updated.fullName || updated.name}'...`);
        resumeDeleted = await deleteResumeFromCloudinary(publicId);
      }
    }

    res.json({
      success: true,
      message: `Candidate stage updated to '${stage}'${resumeDeleted ? ' & Cloudinary resume cleaned up' : ''}`,
      data: updated,
      resumeDeleted
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const deletedCandidate = await RecruitmentModel.deleteApplicant(candidateId);

    if (!deletedCandidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Clean up candidate's resume from Cloudinary
    const publicId = deletedCandidate.resumeFileId;
    let resumeDeleted = false;
    if (publicId) {
      console.log(`[Recruitment Controller] Deleting candidate. Cleaning up Cloudinary resume for '${deletedCandidate.fullName || deletedCandidate.name}'...`);
      resumeDeleted = await deleteResumeFromCloudinary(publicId);
    }

    res.json({
      success: true,
      message: `Candidate record${resumeDeleted ? ' and Cloudinary resume' : ''} deleted successfully`,
      resumeDeleted
    });
  } catch (error) {
    next(error);
  }
};



export const downloadCandidateResume = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    // fileId is the Cloudinary public_id e.g. "resumes/virat_kohli"
    // The resumeLink stored in DB is already a direct HTTPS URL — just redirect to it
    const candidate = await RecruitmentModel.findApplicantByFileId(fileId);
    if (candidate && candidate.resumeLink) {
      return res.redirect(candidate.resumeLink);
    }
    return res.status(404).json({ success: false, message: 'Resume not found' });
  } catch (error) {
    console.error('[Cloudinary] Error fetching resume link:', error.message);
    next(error);
  }
};


