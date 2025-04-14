'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [hasMounted, setHasMounted] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      products: cart.items.map((item) => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text);
      } else {
        clearCart();
        router.push('/order-confirmation');
      }
    } catch (err) {
      console.error(err);
      setError('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Checkout</h1>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Order Summary</h2>
        {cart.items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cart.items.map((item) => (
              <li key={item.id} className='mb-2'>
                {item.title} x {item.quantity} = $
                {(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <div className='text-xl font-bold mt-2'>Total: ${total.toFixed(2)}</div>
      </div>

      <form onSubmit={handlePlaceOrder} className='space-y-4'>
        <h2 className='text-xl font-semibold'>Shipping Address</h2>
        <Input
          name='address'
          placeholder='Street Address'
          value={shippingAddress.address}
          onChange={handleInputChange}
          required
        />
        <Input
          name='city'
          placeholder='City'
          value={shippingAddress.city}
          onChange={handleInputChange}
          required
        />
        <Input
          name='state'
          placeholder='State/Province'
          value={shippingAddress.state}
          onChange={handleInputChange}
          required
        />
        <Input
          name='zip'
          placeholder='Zip/Postal Code'
          value={shippingAddress.zip}
          onChange={handleInputChange}
          required
        />
        <Input
          name='country'
          placeholder='Country'
          value={shippingAddress.country}
          onChange={handleInputChange}
          required
        />

        {error && <p className='text-red-500'>{error}</p>}
        <Button type='submit' disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>
    </div>
  );
}
