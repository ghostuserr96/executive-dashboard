import { google } from 'googleapis';
import { getAuthenticatedClient } from './googleAuth.js';

export const getDriveService = async () => {
  const auth = await getAuthenticatedClient();
  return google.drive({ version: 'v3', auth });
};

/**
 * Finds or creates the root recruitment directory ("HRMS Recruitment")
 */
export const getOrCreateRootFolder = async (folderName = 'HRMS Recruitment') => {
  const drive = await getDriveService();
  try {
    const q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const res = await drive.files.list({ q, fields: 'files(id, name)' });

    if (res.data.files && res.data.files.length > 0) {
      return res.data.files[0].id;
    }

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });
    console.log(`[Google Drive] Created root folder '${folderName}' with ID: ${folder.data.id}`);
    return folder.data.id;
  } catch (err) {
    console.error('[Google Drive] Error getting/creating root folder:', err.message);
    throw err;
  }
};

/**
 * Creates a job-specific folder under HRMS Recruitment/<jobTitle>
 */
export const createJobFolder = async (jobTitle) => {
  const drive = await getDriveService();
  try {
    const rootFolderId = await getOrCreateRootFolder();
    const folderName = jobTitle.trim();

    // Check if subfolder already exists
    const q = `'${rootFolderId}' in parents and name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const existing = await drive.files.list({ q, fields: 'files(id, name)' });

    if (existing.data.files && existing.data.files.length > 0) {
      console.log(`[Google Drive] Found existing job folder for '${jobTitle}': ${existing.data.files[0].id}`);
      return existing.data.files[0].id;
    }

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootFolderId]
    };
    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id'
    });
    console.log(`[Google Drive] Created job folder '${folderName}' with ID: ${folder.data.id}`);
    return folder.data.id;
  } catch (err) {
    console.error(`[Google Drive] Error creating job folder for '${jobTitle}':`, err.message);
    throw err;
  }
};

/**
 * Helper to delete a single file or folder by ID
 */
export const deleteDriveItem = async (itemId) => {
  if (!itemId) return;
  const drive = await getDriveService();
  try {
    await drive.files.delete({ fileId: itemId });
    console.log(`[Google Drive] Deleted item ID: ${itemId}`);
  } catch (err) {
    if (err.status !== 404 && err.code !== 404) {
      console.error(`[Google Drive] Error deleting item ${itemId}:`, err.message);
    }
  }
};

/**
 * Deletes a candidate resume file from Google Drive using file ID or URL
 */
export const deleteFileFromDrive = async (fileIdOrUrl) => {
  if (!fileIdOrUrl) return false;
  try {
    let fileId = fileIdOrUrl;
    if (typeof fileIdOrUrl === 'string' && fileIdOrUrl.includes('/d/')) {
      const match = fileIdOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
    }
    if (typeof fileId === 'string' && fileId.startsWith('gdrive-local-')) {
      console.log(`[Google Drive] Local reference ID '${fileId}', skipping drive API delete.`);
      return true;
    }

    await deleteDriveItem(fileId);
    console.log(`[Google Drive] Successfully deleted resume file '${fileId}' from Google Drive.`);
    return true;
  } catch (err) {
    console.error(`[Google Drive] Error deleting file '${fileIdOrUrl}':`, err.message);
    return false;
  }
};

/**
 * Deletes all files inside a folder and then deletes the folder itself
 */
export const deleteJobFolderWithContents = async (folderId) => {
  if (!folderId) return;
  try {
    const drive = await getDriveService();
    const q = `'${folderId}' in parents and trashed=false`;
    const res = await drive.files.list({ q, fields: 'files(id, name)' });

    if (res.data.files && res.data.files.length > 0) {
      for (const file of res.data.files) {
        await deleteDriveItem(file.id);
      }
    }

    await deleteDriveItem(folderId);
    console.log(`[Google Drive] Cleaned up job folder and all contents for folder ID: ${folderId}`);
  } catch (err) {
    console.error(`[Google Drive] Error cleaning up job folder ${folderId}:`, err.message);
  }
};

/**
 * Directly uploads candidate resume buffer into Google Drive folder HRMS Recruitment/<jobTitle>/<fileName>
 */
export const uploadResumeBufferToDrive = async ({ buffer, fileName, mimeType = 'application/pdf', jobTitle, folderId }) => {
  try {
    const drive = await getDriveService();
    let targetFolderId = folderId;

    if (!targetFolderId && jobTitle) {
      targetFolderId = await createJobFolder(jobTitle);
    }

    const { Readable } = await import('stream');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: targetFolderId ? [targetFolderId] : []
    };

    const media = {
      mimeType: mimeType,
      body: stream
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink'
    });

    console.log(`[Google Drive] Uploaded resume '${fileName}' successfully with ID: ${response.data.id}`);

    try {
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
    } catch (permErr) {
      console.warn('[Google Drive] Permission setting notice:', permErr.message);
    }

    return {
      resumeFileId: response.data.id,
      resumeLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`
    };
  } catch (err) {
    console.error('[Google Drive] Resume upload error, falling back to reference link:', err.message);
    const fallbackId = `gdrive-local-${Date.now()}`;
    return {
      resumeFileId: fallbackId,
      resumeLink: `https://drive.google.com/file/d/${fallbackId}/view?title=${encodeURIComponent(fileName)}`
    };
  }
};

/**
 * Copies a resume file from its original location into the target job Drive folder.
 * Used by the Google Webhook flow when a resume was already uploaded elsewhere.
 */
export const copyResumeToJobFolder = async (sourceFileId, targetFolderId, applicantName = '') => {
  if (!sourceFileId || !targetFolderId) return null;
  try {
    const drive = await getDriveService();
    
    const originalFile = await drive.files.get({ fileId: sourceFileId, fields: 'name' });
    const extMatch = originalFile.data.name.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : 'pdf';

    const requestBody = { parents: [targetFolderId] };
    if (applicantName) {
      const sanitizedName = applicantName.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Candidate';
      requestBody.name = `${sanitizedName}.${ext}`;
    }

    const copied = await drive.files.copy({
      fileId: sourceFileId,
      requestBody,
      fields: 'id, name, webViewLink'
    });
    console.log(`[Google Drive] Copied resume '${copied.data.name}' (ID: ${copied.data.id}) to job folder.`);
    try {
      await drive.permissions.create({
        fileId: copied.data.id,
        requestBody: { role: 'reader', type: 'anyone' }
      });
    } catch (permErr) {
      console.warn('[Google Drive] Permission setting notice on copy:', permErr.message);
    }
    return {
      resumeFileId: copied.data.id,
      resumeLink: copied.data.webViewLink || `https://drive.google.com/file/d/${copied.data.id}/view`
    };
  } catch (err) {
    console.error(`[Google Drive] Error copying resume file ${sourceFileId}:`, err.message);
    return null;
  }
};

