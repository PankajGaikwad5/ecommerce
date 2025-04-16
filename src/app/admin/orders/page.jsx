'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect non-admins (or loading) away
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        const data = await res.json();
        setOrders(data); // Set the orders state to the array directly
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    }
    // Only fetch orders if the user is authenticated and admin.
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchOrders();
    }
  }, [status, session]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className='text-red-500'>{error}</div>;

  // Helper function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      // After update, refresh orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Admin Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className='min-w-full border'>
          <thead>
            <tr className='bg-gray-200'>
              <th className='py-2 px-4 border'>Order ID</th>
              <th className='py-2 px-4 border'>User</th>
              <th className='py-2 px-4 border'>Total</th>
              <th className='py-2 px-4 border'>Payment Status</th>
              <th className='py-2 px-4 border'>Order Status</th>
              <th className='py-2 px-4 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className='border-t'>
                <td className='py-2 px-4 border text-sm'>{order._id}</td>
                <td className='py-2 px-4 border text-sm'>{order.user}</td>
                <td className='py-2 px-4 border text-sm'>
                  ₹ {order.total.toFixed(2)}
                </td>
                <td className='py-2 px-4 border text-sm'>
                  {order.paymentStatus}
                </td>
                <td className='py-2 px-4 border text-sm'>{order.status}</td>
                <td className='py-2 px-4 border text-sm space-x-2'>
                  {/* For simplicity, let's offer buttons to change status */}
                  {order.status !== 'shipped' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                    >
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status !== 'completed' && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateOrderStatus(order._id, 'completed')}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
