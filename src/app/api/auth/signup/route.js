import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await connectToDatabase();
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return new Response('Missing name, email, or password', { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return new Response('Email already in use', { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
  });

  return Response.json({ message: 'User created successfully' });
}
