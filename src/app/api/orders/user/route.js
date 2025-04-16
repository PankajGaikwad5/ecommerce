import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Optional: Only allow admins to access this
  if (session.user.role !== 'admin') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const orders = await Order.find().sort({ createdAt: -1 });
  return NextResponse.json(orders);
}
