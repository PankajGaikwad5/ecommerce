'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { status } = useSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch(`/api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => setOrder(data))
        .catch((err) => console.error('Error fetching order details:', err))
        .finally(() => setLoading(false));
    }
  }, [id, status]);

  if (loading) return <div className='p-4'>Loading...</div>;
  if (!order) return <div className='p-4'>Order not found.</div>;

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Order Details</h1>

      <div className='mb-4'>
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Status:</strong> {order.paymentStatus}
        </p>
        <p>
          <strong>Total:</strong> ₹{order.total}
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className='mb-4'>
        <h2 className='font-semibold mb-1'>Shipping Address</h2>
        <p>{order.shippingAddress.address}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.zip}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>

      <div>
        <h2 className='font-semibold mb-2'>Products:</h2>
        <ul className='space-y-2'>
          {order.products.map((product, index) => (
            <li key={index} className='border p-3 rounded'>
              <p>
                <strong>{product.title}</strong>
              </p>
              <p>Qty: {product.quantity}</p>
              <p>Price: ₹{product.price}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
