import fetch from 'node-fetch';

async function testFetchPinecone() {
  const apiKey = 'pcsk_igHwu_K6ZbJwhPFmKpveS6eKaEQjnV2BhtQAck5igL1FDWrFgD5e4GL6C7n7m47qgPHkh';
  
  const fetchResponse = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-text-embed-v2',
      inputs: [{ text: "test" }],
      parameters: {
        input_type: "passage",
        truncation: 'END'
      }
    })
  });

  const data = await fetchResponse.json();
  console.log("Pinecone response format:", JSON.stringify(data, null, 2));
}

testFetchPinecone().catch(console.error);
