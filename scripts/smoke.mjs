import fetch from 'node-fetch';

const res = await fetch('http://localhost:3000/api/health').catch(()=>null);
console.log('SMOKE /api/health:', res?.status ?? 'NO_RESPONSE');
process.exit(0);







