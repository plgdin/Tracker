import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) env[k.trim()] = v.join('=').trim();
});

async function run() {
  const res = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/items?select=origin`, {
    headers: {
      apikey: env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`
    }
  });
  const data = await res.json();
  const origins = Array.from(new Set(data.map(d => d.origin)));
  console.log('Origins in DB:', origins);
  console.log('Full data:', data);
}
run();
