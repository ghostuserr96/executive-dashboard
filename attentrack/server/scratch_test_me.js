// Wait, I can't easily run a React service script in Node if it uses fetch and import.meta.env
// Instead, I will write a simple Node script to hit the backend directly.
import fetch from 'node-fetch';

async function testMe() {
  try {
    // First, login to get a token
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@attentrack.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log("Login response:", loginData.statusCode);
    
    if (!loginData.data?.token) {
       console.log("No token:", loginData);
       return;
    }
    
    const token = loginData.data.token;
    
    // Now hit /me
    const meRes = await fetch('http://localhost:5000/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const meData = await meRes.json();
    console.log("Me response status:", meRes.status);
    console.log("Me response body:", meData);
    
  } catch (e) {
    console.error(e);
  }
}

testMe();
