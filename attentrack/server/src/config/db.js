import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, './service-account.json');

export let rtdb = null;

// Initialize Firebase Admin if service account exists
try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: 'https://attentrack-7d0f5-default-rtdb.asia-southeast1.firebasedatabase.app'
      });
    }
    rtdb = getDatabase();
    console.log('[Firebase Admin] Initialized Realtime Database successfully with project:', serviceAccount.project_id);
  } else {
    console.warn('[Firebase Admin] Warning: service-account.json not found!');
  }
} catch (fbErr) {
  console.warn('[Firebase Admin] Warning: Could not initialize Firebase Admin:', fbErr.message);
}

// Ensure the db connection is ready
export const connectDatabase = async () => {
  if (rtdb) {
    console.log('[DB] Connected to Firebase Realtime Database natively');
  } else {
    console.warn('[DB] Realtime Database not initialized properly. API calls will fail.');
  }
  return rtdb;
};
