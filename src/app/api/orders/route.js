// src/app/api/orders/route.js
import { sendTeamNotificationEmail } from '@/lib/email';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  await connectToDatabase();
  const orders = await Order.find().sort({ createdAt: -1 });
  console.log('Fetched orders:', orders);
  return Response.json(orders);
}

export async function POST(req) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse(
        'Unauthorized - please log in to place an order',
        { status: 401 }
      );
    }

    const body = await req.json();
    // console.log('Order Payload Received:', body);

    const { products, shippingAddress, paymentStatus } = body;
    if (!products || !shippingAddress) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Calculate total from products array
    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order, using paymentStatus from payload if provided.
    const order = new Order({
      user: session.user.id,
      products,
      shippingAddress,
      paymentStatus: paymentStatus ? paymentStatus : 'pending',
      total,
    });

    await order.save();
    console.log('Order saved successfully:', order);

    const hasBulkyProduct = products.some((product) => product.isBulky);
    console.log('Bulky product detected:', hasBulkyProduct);

    if (hasBulkyProduct) {
      console.log('About to call sendTeamNotificationEmail');
      try {
        await sendTeamNotificationEmail(order);
        console.log('Notification email sent for bulky order.');
      } catch (emailErr) {
        console.error('Failed to send bulky order email:', emailErr);
      }
    }

    return NextResponse.json(
      { message: 'Order placed successfully', orderId: order._id },
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error placing order:', error);
    return new NextResponse('Error placing order', { status: 500 });
  }
}
