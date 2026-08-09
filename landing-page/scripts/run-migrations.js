#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY.');
    process.exit(1);
  }

  const sqlFile = path.resolve(process.cwd(), 'db', 'waitlist.sql');
  let sqlText;
  try {
    sqlText = await fs.readFile(sqlFile, 'utf8');
  } catch (err) {
    console.error('Could not read migration file:', sqlFile, err);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_text: sqlText });
    if (error) {
      throw error;
    }
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
