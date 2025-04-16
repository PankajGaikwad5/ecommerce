'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function AddProductPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isBulky, setIsBulky] = useState(false);

  // For file upload handling:
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Handle file input change (ensure input has name="file")
  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  // Function to upload images to the local API route
  const uploadImages = async () => {
    const uploadedURLs = [];
    setUploading(true);
    try {
      // Create a FormData object and append files
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('file', file));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Image upload failed');
      }

      const data = await res.json();
      uploadedURLs.push(...data.uploadedFiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
    return uploadedURLs;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Upload images and get their URLs
    let imageURLs = [];
    if (imageFiles.length > 0) {
      imageURLs = await uploadImages();
      if (!imageURLs.length) {
        setError('Image upload failed');
        return;
      }
    }

    const payload = {
      title,
      description,
      price: parseFloat(price),
      dimensions: {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        weight: parseFloat(weight),
      },
      images: imageURLs,
      isBulky,
    };

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      setError(text);
    } else {
      router.push('/admin/products');
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Add New Product</h1>
      <form onSubmit={handleSubmit} className='space-y-4 max-w-lg'>
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
        {/* <Input
          type='text'
          placeholder='Dimensions'
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
        /> */}
        <div className='grid grid-cols-2 gap-4'>
          <Input
            type='number'
            step='0.1'
            placeholder='Length (cm)'
            value={length}
            onChange={(e) => setLength(e.target.value)}
            required
          />
          <Input
            type='number'
            step='0.1'
            placeholder='Width (cm)'
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            required
          />
          <Input
            type='number'
            step='0.1'
            placeholder='Height (cm)'
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
          <Input
            type='number'
            step='0.1'
            placeholder='Weight (kg)'
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>

        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isBulky'
            checked={isBulky}
            onChange={(e) => setIsBulky(e.target.checked)}
          />
          <label htmlFor='isBulky'>Is this a bulky product?</label>
        </div>

        {/* File input for image uploads (name attribute must be "file") */}
        <div className='flex flex-col space-y-2'>
          <label className='font-semibold'>Upload Images</label>
          <Input type='file' name='file' multiple onChange={handleFileChange} />
        </div>
        {uploading && <p>Uploading images...</p>}
        {error && <p className='text-red-500 text-sm'>{error}</p>}
        <Button type='submit'>Add Product</Button>
      </form>
    </div>
  );
}
