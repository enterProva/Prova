import { createClient } from '@supabase/supabase-js';

export interface WaitlistEntryInput {
  name: string;
  email: string;
}

export interface WaitlistEntryRecord {
  id: number;
  created_at: string;
}

export class MissingSupabaseConfigError extends Error {
  constructor() {
    super('SUPABASE_URL and SUPABASE_KEY are not configured.');
    this.name = 'MissingSupabaseConfigError';
  }
}

export class DuplicateWaitlistEmailError extends Error {
  constructor(email: string) {
    super(`A waitlist entry already exists for ${email}.`);
    this.name = 'DuplicateWaitlistEmailError';
  }
}

let supabaseClient: ReturnType<typeof createClient> | undefined;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new MissingSupabaseConfigError();
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

export async function createWaitlistEntry(
  input: WaitlistEntryInput,
): Promise<WaitlistEntryRecord> {
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)
    .from('waitlist_entries')
    .insert([{ name: input.name, email: input.email }]);

  if (error) {
    const message = error.message?.toLowerCase() ?? '';
    const details = error.details?.toLowerCase() ?? '';

    if (error.code === '23505' || message.includes('duplicate') || details.includes('duplicate')) {
      throw new DuplicateWaitlistEmailError(input.email);
    }

    throw error;
  }

  if (!error && data !== null) {
    const rows = Array.isArray(data) ? data : [data];
    const firstRow = rows[0];

    if (firstRow && typeof firstRow === 'object') {
      return {
        id: Number((firstRow as Record<string, unknown>).id ?? 0),
        created_at: String((firstRow as Record<string, unknown>).created_at ?? ''),
      };
    }
  }

  return {
    id: 0,
    created_at: new Date().toISOString(),
  };
}
