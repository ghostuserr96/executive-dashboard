import { google } from 'googleapis';
import { getAuthenticatedClient } from './googleAuth.js';
import { config } from '../../config/env.js';

export const getAppsScriptService = async () => {
  const auth = await getAuthenticatedClient();
  return google.script({ version: 'v1', auth });
};

/**
 * Generates the Apps Script JavaScript source code for the bound form
 */
export const generateAppsScriptCode = (jobId, targetWebhookUrl) => {
  const webhookEndpoint = targetWebhookUrl || `${config.webhookUrl}/api/google/webhook`;

  return `
/**
 * Auto-generated AttenTrack HRMS Form Submit Listener
 * Job ID: ${jobId}
 */

function onFormSubmit(e) {
  try {
    var form = FormApp.getActiveForm();
    var response = e ? e.response : form.getResponses().slice(-1)[0];
    if (!response) return;

    var itemResponses = response.getItemResponses();
    var answers = {};

    for (var i = 0; i < itemResponses.length; i++) {
      var itemResponse = itemResponses[i];
      var title = itemResponse.getItem().getTitle();
      var answer = itemResponse.getResponse();
      answers[title] = answer;
    }

    var payload = {
      jobId: "${jobId}",
      name: answers["Full Name"] || answers["Name"] || answers["Candidate Name"] || answers["Applicant Name"] || "Anonymous Applicant",
      email: answers["Email"] || answers["Email Address"] || answers["Work Email"] || "",
      phone: answers["Phone"] || answers["Phone Number"] || answers["Mobile"] || answers["Contact Number"] || "",
      experience: answers["Years of Experience"] || answers["Experience"] || answers["Total Experience"] || "0-2 Years",
      skills: answers["Skills"] || answers["Key Skills"] || answers["Primary Skills"] || "",
      linkedin: answers["LinkedIn"] || answers["LinkedIn Profile"] || answers["LinkedIn URL"] || "",
      portfolio: answers["Portfolio"] || answers["Portfolio URL"] || answers["Website"] || "",
      resumeFileId: "",
      resumeLink: "",
      appliedAt: new Date().toISOString()
    };

    // Extract uploaded file ID (Resume)
    var formItems = form.getItems();
    for (var j = 0; j < formItems.length; j++) {
      var item = formItems[j];
      if (item.getType() == FormApp.ItemType.FILE_UPLOAD) {
        var resp = response.getResponseForItem(item);
        if (resp) {
          var val = resp.getResponse();
          if (Array.isArray(val) && val.length > 0) {
            payload.resumeFileId = val[0];
            payload.resumeLink = "https://drive.google.com/file/d/" + val[0] + "/view";
          } else if (typeof val === 'string') {
            payload.resumeFileId = val;
            payload.resumeLink = "https://drive.google.com/file/d/" + val + "/view";
          }
        }
      }
    }

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var url = "${webhookEndpoint}";
    Logger.log("Sending payload to webhook: " + url);
    var res = UrlFetchApp.fetch(url, options);
    Logger.log("Webhook response code: " + res.getResponseCode());
  } catch (err) {
    Logger.log("Error in onFormSubmit: " + err.toString());
  }
}

function createFormSubmitTrigger() {
  var form = FormApp.getActiveForm();
  var triggers = ScriptApp.getUserTriggers(form);
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();
  Logger.log("Form submit trigger created successfully.");
}
`;
};

/**
 * Creates and deploys an Apps Script project bound to the specified Google Form
 */
export const setupAppsScriptForForm = async (formId, jobId) => {
  const scriptService = await getAppsScriptService();
  const webhookEndpoint = `${config.webhookUrl}/api/google/webhook`;
  const codeContent = generateAppsScriptCode(jobId, webhookEndpoint);

  try {
    // 1. Create Apps Script Project container bound to Form
    const createRes = await scriptService.projects.create({
      requestBody: {
        title: `AttenTrack Webhook Sync - Job ${jobId}`,
        parentId: formId
      }
    });

    const scriptId = createRes.data.scriptId;
    console.log(`[Google Apps Script] Created script project ID: ${scriptId} for Form ID: ${formId}`);

    // 2. Update code content
    await scriptService.projects.updateContent({
      scriptId,
      requestBody: {
        files: [
          {
            name: 'Code',
            type: 'SERVER_JS',
            source: codeContent
          },
          {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify({
              timeZone: 'America/New_York',
              dependencies: {},
              exceptionLogging: 'STACKDRIVER',
              runtimeVersion: 'V8'
            })
          }
        ]
      }
    });

    console.log(`[Google Apps Script] Updated script content for project ID: ${scriptId}`);

    return {
      scriptId,
      webhookEndpoint,
      status: 'Created successfully'
    };
  } catch (err) {
    console.warn(`[Google Apps Script] Apps Script API creation info/notice: ${err.message}`);
    // Return fallback info so system continues seamlessly
    return {
      scriptId: null,
      webhookEndpoint,
      manualCode: codeContent,
      notice: 'Apps Script template code generated. Note: If Google Apps Script API is disabled in GCP Console, enable it at https://script.google.com/home/usersettings'
    };
  }
};
