const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim().replace(/(^"|"$)/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

s.from('leads').select('*').limit(1)
  .then(r => {
     if (r.error) console.error("Query Error:", r.error);
     else console.log("Columns:", Object.keys(r.data[0] || {}));
  })
  .catch(e => console.error("Exception:", e));
