'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession, signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [name, setName] = useState('');
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // <-- Add header here
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      setError(text);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <form
        onSubmit={handleSignUp}
        className='w-full max-w-sm space-y-4 bg-white dark:bg-zinc-900 p-6 rounded shadow'
      >
        <h2 className='text-xl font-semibold'>Create an Account</h2>

        <Input
          type='text'
          placeholder='Full Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Sign Up
        </Button>
        <Button onClick={() => signIn('google')} className='w-full'>
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
