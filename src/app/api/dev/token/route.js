// app/api/dev/token/route.js
import { getToken } from 'next-auth/jwt';

export async function GET(req) {
  // Set raw: true to get the complete encoded JWT
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
  });

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
