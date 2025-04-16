import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from 'next-auth/jwt';

export async function GET() {
  await connectToDatabase();
  const products = await Product.find().sort({ createdAt: -1 });
  return Response.json(products);
}

// export async function POST(req) {
//   // Pass raw: true if you need the raw token, but getToken will read from the Authorization header
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   if (!token || token.role !== 'admin') {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   const body = await req.json();

//   try {
//     await connectToDatabase();
//     const product = await Product.create(body);
//     return Response.json(product, { status: 201 });
//   } catch (err) {
//     return new Response(err.message, { status: 500 });
//   }
// }
export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    description,
    price,
    images,
    isBulky,
    dimensions, // should be { length, width, height, weight }
  } = body;

  // Optional: Validate fields before inserting

  try {
    await connectToDatabase();

    const product = await Product.create({
      title,
      description,
      price,
      images,
      isBulky,
      dimensions: {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
        weight: dimensions.weight,
      },
    });

    return Response.json(product, { status: 201 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

// export async function POST(req) {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user.role !== 'admin') {
//     return new Response('Unauthorized', { status: 401 });
//   }

//   const body = await req.json();

//   try {
//     await connectToDatabase();
//     const product = await Product.create(body);
//     return Response.json(product, { status: 201 });
//   } catch (err) {
//     return new Response(err.message, { status: 500 });
//   }
// }
