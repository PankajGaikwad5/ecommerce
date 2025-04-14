import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';

export async function GET(_, { params }) {
  await connectToDatabase();
  const product = await Product.findById(params.id);
  if (!product) return new Response('Not found', { status: 404 });
  return Response.json(product);
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  // if (!session || session.user.role !== 'admin') {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const updates = await req.json();

  await connectToDatabase();
  const updated = await Product.findByIdAndUpdate(params.id, updates, {
    new: true,
  });
  return Response.json(updated);
}

export async function DELETE(_, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  await connectToDatabase();
  await Product.findByIdAndDelete(params.id);
  return new Response('Deleted', { status: 200 });
}
