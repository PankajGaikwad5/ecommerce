'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  // console.log('User ID:', session?.user?.id);

  return (
    <nav className='flex items-center justify-between bg-gray-100 p-4 shadow'>
      {/* Logo / Home Link */}
      <Link href='/'>
        <span className='text-xl font-bold'>eCommerce Site</span>
      </Link>

      <div className='flex items-center space-x-4'>
        {session?.user ? (
          <>
            {/* Show user name and logout button */}
            <span className='text-gray-700'>
              Hi, {session.user.name || session.user.email}
            </span>
            <Button
              variant='secondary'
              className='bg-blue-600 text-white hover:bg-blue-300 transition-all duration-200 hover:text-black'
              onClick={() => router.push('/cart')}
            >
              Go to Cart
            </Button>
            <Button onClick={() => signOut()} variant='outline'>
              Logout
            </Button>
          </>
        ) : (
          <>
            {/* Show login and signup options */}
            <Link href='/login'>
              <span className='text-gray-700 hover:underline'>Login</span>
            </Link>
            <Link href='/signup'>
              <span className='text-gray-700 hover:underline'>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
