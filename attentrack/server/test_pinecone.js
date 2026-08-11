import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: 'dummy' });
console.log(typeof pc.inference?.embed);
