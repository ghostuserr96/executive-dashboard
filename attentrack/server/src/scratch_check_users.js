import { rtdb } from './config/db.js';

async function checkStructure() {
  const snap = await rtdb.ref('users').once('value');
  const val = snap.val();
  console.log("Is array?", Array.isArray(val));
  console.log("Keys:", Object.keys(val || {}));
  
  if (Array.isArray(val)) {
    console.log("Index 0:", val[0]?.id);
    console.log("Index 1:", val[1]?.id);
  }
  process.exit(0);
}

checkStructure();
