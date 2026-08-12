import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, './service-account.json');

export let rtdb = null;

try {
  let serviceAccount = null;

  // 1. Prefer env var (Vercel / production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  // 2. Fallback: local file (dev)
  else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
  }

  if (serviceAccount) {
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL ||
          'https://attentrack-7d0f5-default-rtdb.asia-southeast1.firebasedatabase.app'
      });
    }
    rtdb = getDatabase();
    console.log('[Firebase Admin] Initialized RTDB for project:', serviceAccount.project_id);
  } else {
    console.warn('[Firebase Admin] No service account found — set FIREBASE_SERVICE_ACCOUNT env var.');
  }
} catch (fbErr) {
  console.warn('[Firebase Admin] Init failed:', fbErr.message);
}

export const connectDatabase = async () => {
  if (rtdb) {
    console.log('[DB] Connected to Firebase Realtime Database');
  } else {
    console.warn('[DB] Realtime Database not initialized. API calls will fail.');
  }
  return rtdb;
};
