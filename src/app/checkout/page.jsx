'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Helper to load Razorpay script (used only if non-bulky orders are ever allowed)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // Determine if the cart contains any bulky items
  const hasBulkyItem = cart.items.some((item) => item.isBulky);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  // Calculate total from cart items.
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // console.log(cart.items.some((item) => item.isBulky));
  // For bulky items: No payment processing. Instead, a manual call request will be placed.
  const handleRequestCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      products: cart.items.map((item) => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        isBulky: item.isBulky,
      })),
      shippingAddress,
      // Payment will be handled manually later. Use a status to indicate that.
      paymentStatus: 'pending_manual',
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

  // Only for non-bulky orders, if ever needed.
  const handleRazorpayPayment = async () => {
    // If the cart has a bulky item, warn and prevent payment.
    if (hasBulkyItem) {
      alert(
        'This order includes bulky items. Please request a call as payment will be confirmed after manual verification.'
      );
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Failed to load Razorpay SDK. Are you online?');
      return;
    }

    // Create an order in Razorpay via our API
    const orderRes = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });

    const data = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: 'Your Store Name',
      description: 'Order Payment',
      order_id: data.id,
      handler: async function (response) {
        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              products: cart.items.map((item) => ({
                productId: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
              })),
              shippingAddress,
              paymentStatus: 'paid',
            }),
          });
          clearCart();
          router.push('/order-confirmation');
        } catch (error) {
          console.error('Order saving failed after payment', error);
          alert(
            'Payment succeeded, but order saving failed. Please contact support.'
          );
        }
      },
      prefill: { name: '', email: '', contact: '' },
      theme: { color: '#6366f1' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Checkout</h1>

      {hasBulkyItem ? (
        <div className='mb-4 bg-yellow-100 p-4 rounded'>
          <p className='text-yellow-800'>
            Your order includes bulky products. We do not take payments before
            confirmation for bulky items. After you request a call, a member of
            our team will contact you to discuss shipping details and confirm
            your order.
          </p>
        </div>
      ) : (
        <div className='mb-4'>
          <p>
            Order Total: <strong>${total.toFixed(2)}</strong>
          </p>
        </div>
      )}

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
        {!hasBulkyItem && (
          <div className='text-xl font-bold mt-2'>
            Total: ${total.toFixed(2)}
          </div>
        )}
      </div>

      <form
        onSubmit={hasBulkyItem ? handleRequestCall : (e) => e.preventDefault()}
        className='space-y-4'
      >
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

        <div className='flex gap-4'>
          {hasBulkyItem ? (
            // For bulky items, only show the "Request a Call" button.
            <Button type='submit' disabled={loading}>
              {loading ? 'Placing Order Request...' : 'Request a Call'}
            </Button>
          ) : (
            <>
              <Button type='button' onClick={handleRazorpayPayment}>
                Pay Online
              </Button>
              <Button
                type='button'
                onClick={handleRequestCall}
                disabled={loading}
              >
                Place COD Order
              </Button>
            </>
          )}
        </div>

        {error && <p className='text-red-500 text-sm'>{error}</p>}
      </form>
    </div>
  );
}
