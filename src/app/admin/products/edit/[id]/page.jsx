'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Extract product ID from route params

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Product fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [images, setImages] = useState(''); // We'll use comma-separated URLs

  // Fetch the product details when the ID is available
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setDimensions(data.dimensions || '');
          // Convert array of images to a comma-separated string
          setImages(data.images ? data.images.join(', ') : '');
        } else {
          setError('Failed to fetch product');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Handle form submission to update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    const updatedProduct = {
      title,
      description,
      price: parseFloat(price),
      dimensions,
      images: images
        .split(',')
        .map((url) => url.trim())
        .filter((url) => url), // clean empty strings
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (res.ok) {
        router.push('/admin/products'); // Redirect back to the products list on success
      } else {
        const message = await res.text();
        setError(message);
      }
    } catch (err) {
      setError('Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Edit Product</h1>
      <form onSubmit={handleUpdate} className='space-y-4 max-w-lg'>
        <Input
          type='text'
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          type='number'
          placeholder='Price'
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          type='text'
          placeholder='Dimensions'
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
        />
        <Input
          type='text'
          placeholder='Image URLs (comma separated)'
          value={images}
          onChange={(e) => setImages(e.target.value)}
        />
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Button type='submit'>Update Product</Button>
      </form>
    </div>
  );
}
