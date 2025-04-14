'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the user is not authenticated, redirect to login.
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    // If authenticated but not an admin, redirect to home.
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;

  return <div>Welcome to the Admin Page!</div>;
}
