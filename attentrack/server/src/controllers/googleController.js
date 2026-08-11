import { getAuthUrl, handleAuthCallback } from '../services/google/googleAuth.js';
import { copyResumeToJobFolder, deleteJobFolderWithContents } from '../services/google/googleDrive.js';
import { RecruitmentModel } from '../models/Recruitment.js';
import { config } from '../config/env.js';



/**
 * GET /api/google/auth
 * Generates OAuth authorization URL
 */
export const getOAuthUrl = async (req, res, next) => {
  try {
    const url = getAuthUrl();
    if (req.query.json === 'true') {
      return res.json({ success: true, authUrl: url });
    }
    // Redirect directly to Google OAuth consent screen
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/google/callback
 * Handles OAuth callback code exchange
 */
export const handleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is missing.' });
    }
    const tokens = await handleAuthCallback(code);
    res.send(`
      <! ordination html>
      <html>
      <head>
        <title>Google Authorization Successful</title>
        <meta http-equiv="refresh" content="3;url=${config.corsOrigin}" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #0F172A; color: #F8FAFC; }
          .card { max-width: 500px; margin: 0 auto; background: #1E293B; border: 1px solid #334155; border-radius: 24px; padding: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #10B981; font-size: 24px; margin-bottom: 12px; }
          p { color: #94A3B8; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #2563EB; color: white; font-weight: 600; padding: 12px 28px; border-radius: 12px; text-decoration: none; margin-top: 20px; transition: all 0.2s; }
          .btn:hover { background: #1D4ED8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Google Workspace Connected!</h1>
          <p>Tokens saved (access_token, refresh_token, expiry_date). AttenTrack is ready to auto-create Google Forms and Drive folders.</p>
          <p style="font-size: 12px; color: #64748B;">Redirecting to Dashboard in 3 seconds...</p>
          <a href="${config.corsOrigin}" class="btn">Return to Dashboard Now</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {


    next(error);
  }
};

/**
 * POST /api/google/webhook
 * Receives application submission from Google Apps Script trigger
 */
export const handleWebhook = async (req, res, next) => {
  try {
    console.log('[Google Webhook] Received submission payload:', JSON.stringify(req.body, null, 2));

    const {
      jobId,
      name,
      email,
      phone,
      experience,
      skills,
      linkedin,
      portfolio,
      resumeFileId: rawResumeFileId,
      resumeLink: rawResumeLink
    } = req.body;

    let finalResumeFileId = rawResumeFileId || '';
    let finalResumeLink = rawResumeLink || '';
    let driveFolderId = '';

    // Step 1: Find job by jobId
    let job = null;
    if (jobId) {
      job = await RecruitmentModel.findJobById(jobId);
    }

    // Step 2: If file was uploaded and job has a Drive folder, organize resume into HRMS Recruitment/<Job Title>/
    if (rawResumeFileId && job && job.driveFolderId) {
      driveFolderId = job.driveFolderId;
      console.log(`[Google Webhook] Copying resume ${rawResumeFileId} to job folder ${driveFolderId}...`);
      const copyResult = await copyResumeToJobFolder(rawResumeFileId, driveFolderId, name);
      if (copyResult) {
        finalResumeFileId = copyResult.resumeFileId;
        finalResumeLink = copyResult.resumeLink;
      }
    }

    // Step 3: Save applicant record to DB (Firestore + dbStore)
    const applicant = await RecruitmentModel.createApplicant({
      jobId: jobId || (job ? job.id : null),
      name: name || 'Anonymous Applicant',
      email: email || '',
      phone: phone || '',
      experience: experience || '',
      skills: skills || '',
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      resumeFileId: finalResumeFileId,
      resumeLink: finalResumeLink,
      driveFolderId,
      appliedAt: new Date().toISOString(),
      status: 'Applied'
    });

    console.log(`[Google Webhook] Successfully recorded applicant ${applicant.name} (ID: ${applicant.id}) for Job ${jobId}`);

    res.status(201).json({
      success: true,
      message: 'Application recorded and resume organized successfully.',
      applicant
    });
  } catch (error) {
    console.error('[Google Webhook] Error processing webhook submission:', error);
    next(error);
  }
};

/**
 * DELETE /api/jobs/:id/google-cleanup (or /api/google/cleanup/:id)
 * Cleans up Google Drive folder, uploaded resumes, and copied Google Form when recruitment closes
 */
export const cleanupJobGoogleResources = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    console.log(`[Google Cleanup] Initiating cleanup for Job ID: ${jobId}`);

    const job = await RecruitmentModel.findJobById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const { driveFolderId, formId } = job;

    // 1. Delete all uploaded resume files and the job Drive folder
    if (driveFolderId) {
      console.log(`[Google Cleanup] Deleting job Drive folder and contents: ${driveFolderId}`);
      await deleteJobFolderWithContents(driveFolderId);
    }

    // 2. Update Job status in Database
    const updatedJob = await RecruitmentModel.updateJob(jobId, {
      status: 'Closed',
      driveFolderId: null,
      closedAt: new Date().toISOString()
    });


    res.json({
      success: true,
      message: `Job ${job.title} Google resources cleaned up successfully.`,
      job: updatedJob
    });
  } catch (error) {
    console.error('[Google Cleanup] Error cleaning up Google resources:', error);
    next(error);
  }
};
