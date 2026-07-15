import postgres from 'postgres';

export interface WaitlistEntryInput {
  name: string;
  email: string;
}

export interface WaitlistEntryRecord {
  id: number;
  created_at: string;
}

export class MissingDatabaseUrlError extends Error {
  constructor() {
    super('DATABASE_URL is not configured.');
    this.name = 'MissingDatabaseUrlError';
  }
}

export class DuplicateWaitlistEmailError extends Error {
  constructor(email: string) {
    super(`A waitlist entry already exists for ${email}.`);
    this.name = 'DuplicateWaitlistEmailError';
  }
}

let sqlClient: ReturnType<typeof postgres> | undefined;

function getSql() {
  if (sqlClient) {
    return sqlClient;
  }

  const connectionString = import.meta.env.DATABASE_URL;

  if (!connectionString) {
    throw new MissingDatabaseUrlError();
  }

  sqlClient = postgres(connectionString);
  return sqlClient;
}

export async function createWaitlistEntry(
  input: WaitlistEntryInput,
): Promise<WaitlistEntryRecord> {
  const sql = getSql();

  try {
    const [entry] = await sql<WaitlistEntryRecord[]>`
      insert into waitlist_entries (name, email)
      values (${input.name}, ${input.email})
      returning id, created_at
    `;

    return entry;
  } catch (error) {
    if (error instanceof postgres.PostgresError && error.code === '23505') {
      throw new DuplicateWaitlistEmailError(input.email);
    }

    throw error;
  }
}
