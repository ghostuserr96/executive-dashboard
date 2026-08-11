import { google } from 'googleapis';
import { getAuthenticatedClient } from './googleAuth.js';
import { config } from '../../config/env.js';

export const getFormsService = async () => {
  const auth = await getAuthenticatedClient();
  return google.forms({ version: 'v1', auth });
};

export const getDriveService = async () => {
  const auth = await getAuthenticatedClient();
  return google.drive({ version: 'v3', auth });
};

/**
 * Duplicates template form and customizes title, description, and confirmation message
 */
export const createJobFormFromTemplate = async (jobTitle, jobDescription = '') => {
  const masterTemplateId = config.googleTemplateFormId;
  if (!masterTemplateId) {
    throw new Error('GOOGLE_TEMPLATE_FORM_ID environment variable is missing.');
  }

  const drive = await getDriveService();
  const forms = await getFormsService();

  console.log(`[Google Forms] Duplicating template form ID: ${masterTemplateId} for '${jobTitle}'`);

  // Step 1: Copy template form using Drive API
  const copyRes = await drive.files.copy({
    fileId: masterTemplateId,
    requestBody: {
      name: `Job Application: ${jobTitle}`
    },
    fields: 'id, name, webViewLink'
  });

  const formId = copyRes.data.id;
  const editUrl = copyRes.data.webViewLink || `https://docs.google.com/forms/d/${formId}/edit`;

  console.log(`[Google Forms] Template copied successfully. New Form ID: ${formId}`);

  // Step 2: Update Title, Description & Confirmation Message using Forms API batchUpdate
  try {
    const updateRequests = [
      {
        updateFormInfo: {
          info: {
            title: `${jobTitle} - Application Form`,
            description: jobDescription || `Thank you for your interest in joining our team as a ${jobTitle}. Please fill out all required details and upload your latest resume below.`
          },
          updateMask: 'title,description'
        }
      },
      {
        updateSettings: {
          settings: {
            quizSettings: { isQuiz: false }
          },
          updateMask: 'quizSettings'
        }
      }
    ];

    await forms.forms.batchUpdate({
      formId,
      requestBody: {
        requests: updateRequests
      }
    });

    console.log(`[Google Forms] Updated form info for Form ID: ${formId}`);
  } catch (updateErr) {
    console.warn(`[Google Forms] Non-fatal warning updating form info: ${updateErr.message}`);
  }

  // Step 3: Fetch updated form details to get responder URI
  const updatedForm = await forms.forms.get({ formId });
  const formUrl = updatedForm.data.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;

  return {
    formId,
    formUrl,
    editUrl
  };
};

/**
 * Deletes a Google Form by Form ID (Guards against deleting the master template)
 */
export const deleteForm = async (formId) => {
  if (!formId) return;

  const masterTemplateId = config.googleTemplateFormId;
  if (formId === masterTemplateId) {
    console.error(`[Google Forms] SECURITY CHECK: Attempted to delete master template form ${formId}! Aborting.`);
    return;
  }

  const drive = await getDriveService();
  try {
    await drive.files.delete({ fileId: formId });
    console.log(`[Google Forms] Successfully deleted copied form ID: ${formId}`);
  } catch (err) {
    if (err.status !== 404 && err.code !== 404) {
      console.error(`[Google Forms] Error deleting form ${formId}:`, err.message);
    }
  }
};
