import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  const pin = '123456';
  const hash = await bcrypt.hash(pin, 10);

  const { data, error } = await supabase
    .from('app_user')
    .update({ pin_hash: hash })
    .eq('internal_code', 'INM-1001')
    .select();

  if (error) throw error;
  console.log('Updated:', data);
}
main().catch(e => { console.error(e); process.exit(1); });
