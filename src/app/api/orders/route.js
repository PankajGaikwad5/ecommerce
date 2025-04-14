import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getToken } from 'next-auth/jwt';

export async function POST(req) {
  // Authenticate: Use getToken() to get the session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  await connectToDatabase();

  try {
    const { products, shippingAddress } = await req.json();
    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response('No products provided', { status: 400 });
    }

    // Calculate total from the products array
    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: token.id,
      products,
      total,
      shippingAddress, // Can be optional initially
      status: 'pending',
    });

    return new Response(JSON.stringify(order), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response('Server error', { status: 500 });
  }
}
