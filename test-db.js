const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
s.from('leads').select('*').limit(1).then(r => console.log(JSON.stringify(r.data ? Object.keys(r.data[0] || {}) : r.error))).catch(e => console.error(e));
