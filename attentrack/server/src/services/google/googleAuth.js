import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKENS_PATH = path.resolve(__dirname, '../../config/google-tokens.json');

export const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments'
];


export const getOAuth2Client = () => {
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing from environment variables.');
  }
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
};

export const getAuthUrl = () => {
  const oAuth2Client = getOAuth2Client();
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: REQUIRED_SCOPES
  });
};

export const saveTokens = (tokens) => {
  try {
    let existing = {};
    if (fs.existsSync(TOKENS_PATH)) {
      existing = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));
    }
    const merged = { ...existing, ...tokens };
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    console.log('[Google Auth] Tokens saved successfully to:', TOKENS_PATH);
    return merged;
  } catch (err) {
    console.error('[Google Auth] Failed to save tokens:', err.message);
    throw err;
  }
};

export const loadTokens = () => {
  if (!fs.existsSync(TOKENS_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(TOKENS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Google Auth] Failed to read tokens file:', err.message);
    return null;
  }
};

export const getAuthenticatedClient = async () => {
  const oAuth2Client = getOAuth2Client();
  const tokens = loadTokens();

  if (!tokens) {
    const authUrl = getAuthUrl();
    const errorMsg = `Google OAuth2 tokens not found. Please authenticate first by visiting: ${authUrl}`;
    console.error('[Google Auth]', errorMsg);
    throw new Error(errorMsg);
  }

  oAuth2Client.setCredentials(tokens);

  // Handle token refresh automatically if needed
  oAuth2Client.on('tokens', (newTokens) => {
    console.log('[Google Auth] Received refreshed OAuth tokens');
    saveTokens(newTokens);
  });

  return oAuth2Client;
};

export const handleAuthCallback = async (code) => {
  const oAuth2Client = getOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  saveTokens(tokens);
  return tokens;
};
