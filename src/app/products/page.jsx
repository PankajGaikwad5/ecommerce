'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold mb-6'>Our Products</h1>
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {products.map((product) => (
            <div
              key={product._id}
              className='border rounded-lg p-4 flex flex-col justify-between shadow'
            >
              <h2 className='text-xl font-semibold mb-2'>{product.title}</h2>
              <p className='text-gray-700 mb-2'>{product.description}</p>
              <p className='font-bold text-lg mb-4'>
                ${product.price.toFixed(2)}
              </p>
              <Link href={`/products/${product._id}`}>
                <Button className='mt-auto'>View Details</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
