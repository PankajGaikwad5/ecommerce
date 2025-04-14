'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if the user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error('Error fetching products');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (status === 'loading' || loading) return <div>Loading...</div>;

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Admin Products</h1>
      {/* Button to navigate to Add Product Page */}
      <Button
        onClick={() => router.push('/admin/products/add')}
        className='mb-4'
      >
        Add Product
      </Button>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className='min-w-full border'>
          <thead>
            <tr className='bg-gray-200'>
              <th className='py-2 px-4 border'>Title</th>
              <th className='py-2 px-4 border'>Description</th>
              <th className='py-2 px-4 border'>Price</th>
              <th className='py-2 px-4 border'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td className='py-2 px-4 border'>{product.title}</td>
                <td className='py-2 px-4 border'>{product.description}</td>
                <td className='py-2 px-4 border'>${product.price}</td>
                <td className='py-2 px-4 border space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      router.push(`/admin/products/edit/${product._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={async () => {
                      if (
                        confirm('Are you sure you want to delete this product?')
                      ) {
                        const res = await fetch(
                          `/api/products/${product._id}`,
                          {
                            method: 'DELETE',
                          }
                        );
                        if (res.ok) {
                          // Remove the deleted product from state
                          setProducts(
                            products.filter((p) => p._id !== product._id)
                          );
                        } else {
                          alert('Delete failed');
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
