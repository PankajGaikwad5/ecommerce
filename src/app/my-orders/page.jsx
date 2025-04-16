'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetch('/api/orders/user')
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
          }
          return res.json();
        })
        .then((data) => setOrders(data))
        .catch((err) => {
          console.error('Error fetching orders:', err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (loading) return <div className='p-6'>Loading your orders...</div>;

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>My Orders</h1>

      {orders.length === 0 ? (
        <p className='text-gray-600'>You haven't placed any orders yet.</p>
      ) : (
        <div className='space-y-6'>
          {orders.map((order) => (
            <div key={order._id} className='border rounded-lg p-4 shadow-sm'>
              <h2 className='font-semibold text-lg mb-2'>
                Order ID: {order._id}
              </h2>
              <p className='text-sm text-gray-500 mb-2'>
                Placed on: {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className='mb-2'>
                Payment Status: <strong>{order.paymentStatus}</strong>
              </p>
              <p className='mb-2'>Total: ₹{order.total.toFixed(2)}</p>

              <div className='border-t mt-4 pt-2'>
                <h3 className='font-medium mb-2'>Products:</h3>
                <ul className='list-disc pl-5 space-y-1'>
                  {order.products.map((product, index) => (
                    <li key={index}>
                      {product.title} × {product.quantity} (₹{product.price})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
