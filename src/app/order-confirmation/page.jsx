'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const router = useRouter();

  return (
    <div className='p-6 max-w-xl mx-auto text-center'>
      <h1 className='text-3xl font-bold mb-4'>Thank You!</h1>
      <p className='mb-4'>Your order has been placed successfully.</p>
      <p className='mb-4'>
        We have received your order and will notify you once it is on its way.
      </p>
      <Button onClick={() => router.push('/')}>Back to Home</Button>
    </div>
  );
}
