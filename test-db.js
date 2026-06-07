import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log('Checking ledger_purchase_invoices...');
  const { data: invData, error: invError } = await supabase.from('ledger_purchase_invoices').select('*').limit(1);
  
  if (invError) {
    console.error('Error fetching invoices:', invError);
  } else {
    console.log('Success! Table exists. Data:', invData);
  }

  console.log('\nChecking ledger_purchase_items...');
  const { data: itemsData, error: itemsError } = await supabase.from('ledger_purchase_items').select('*').limit(1);

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
  } else {
    console.log('Success! Table exists. Data:', itemsData);
  }
}

check();
