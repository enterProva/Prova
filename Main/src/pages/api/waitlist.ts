import type { APIRoute } from 'astro';

import {
  createWaitlistEntry,
  DuplicateWaitlistEmailError,
  MissingDatabaseUrlError,
} from '../../lib/waitlist';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return jsonResponse('Submit the waitlist form with a valid name and email.', 400);
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!name) {
    return jsonResponse('Please enter your name.', 400);
  }

  if (!email) {
    return jsonResponse('Please enter your email address.', 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse('Please enter a valid email address.', 400);
  }

  try {
    await createWaitlistEntry({ name, email });
    return jsonResponse('You are on the waitlist. We will be in touch soon.', 201);
  } catch (error) {
    if (error instanceof DuplicateWaitlistEmailError) {
      return jsonResponse('That email is already on the waitlist.', 409);
    }

    if (error instanceof MissingDatabaseUrlError) {
      console.error(error.message);
      return jsonResponse('The waitlist is not configured yet. Add DATABASE_URL and try again.', 500);
    }

    console.error('Waitlist insert failed', error);
    return jsonResponse('Something went wrong while saving your request.', 500);
  }
};

export const ALL: APIRoute = async () =>
  new Response(JSON.stringify({ message: 'Method not allowed.' }), {
    status: 405,
    headers: {
      Allow: 'POST',
      'Content-Type': 'application/json',
    },
  });
