'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session) {
      // If user is logged in, redirect them to home or admin page.
      router.push('/');
    }
  }, [session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email, // ✅ match the field expected in authorize()
      password,
    });

    if (res?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/'); // or wherever your dashboard is
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <form
        onSubmit={handleLogin}
        className='w-full max-w-sm space-y-4 bg-white dark:bg-zinc-900 p-6 rounded shadow'
      >
        <h2 className='text-xl font-semibold'>Login</h2>

        <Input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className='text-red-500 text-sm'>{error}</p>}

        <Button type='submit' className='w-full'>
          Login
        </Button>
        <Button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className='w-full'
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
