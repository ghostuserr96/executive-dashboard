import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/v1/rag/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'what is this?',
        documentId: 'test-id',
        history: []
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
