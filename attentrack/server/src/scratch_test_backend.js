import { rtdb } from './config/db.js';
import { AuthService } from './services/auth.service.js';
import fetch from 'node-fetch';

async function testBackend() {
  try {
    // 1. Get first user from DB
    const snap = await rtdb.ref('users').once('value');
    const users = snap.val();
    if (!users) {
      console.log("No users found in DB");
      return;
    }
    const user = Object.values(users)[0];
    console.log("Found user:", user.email, user.id);

    // 2. Generate token
    const token = AuthService.generateToken(user);
    console.log("Generated token:", token.substring(0, 20) + "...");

    // 3. Hit /auth/me
    const res = await fetch('http://localhost:5000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const contentType = res.headers.get('content-type');
    console.log("Content-Type:", contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);
    } else {
      const text = await res.text();
      console.log("Response status:", res.status);
      console.log("Response text:", text);
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testBackend();
