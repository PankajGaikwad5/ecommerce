import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const order = await Order.findById(params.id).populate('user');

    // Restrict normal user from accessing others' orders
    if (
      session.user.role !== 'admin' &&
      order.user._id.toString() !== session.user.id
    ) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    return new NextResponse('Failed to fetch order', { status: 500 });
  }
}
