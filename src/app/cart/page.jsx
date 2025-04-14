'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeItem, clearCart } = useCart();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className='p-6 max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Your Cart</h1>

      {cart.items.length === 0 ? (
        <div>
          <p className='mb-4'>Your cart is empty.</p>
          <Button onClick={() => router.push('/products')}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <table className='min-w-full border mb-6'>
            <thead>
              <tr className='bg-gray-200'>
                <th className='px-4 py-2 text-left'>Product</th>
                <th className='px-4 py-2 text-left'>Quantity</th>
                <th className='px-4 py-2 text-left'>Price</th>
                <th className='px-4 py-2 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id} className='border-t'>
                  <td className='px-4 py-2'>{item.title}</td>
                  <td className='px-4 py-2'>{item.quantity}</td>
                  <td className='px-4 py-2'>
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                  <td className='px-4 py-2'>
                    <Button
                      variant='outline'
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='text-xl font-bold mb-4'>
            Total: ${total.toFixed(2)}
          </div>

          <div className='flex gap-4'>
            <Button onClick={() => router.push('/checkout')}>
              Go to Checkout
            </Button>
            <Button variant='destructive' onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
