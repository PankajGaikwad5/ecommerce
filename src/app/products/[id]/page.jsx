'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, addItem, updateItemQuantity } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Error fetching product');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div>Loading product...</div>;
  if (error) return <div>{error}</div>;
  if (!product) return null;

  // Check if the product exists in the cart.
  const cartItem = cart.items.find((i) => i.id === product._id);

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <Button variant='outline' onClick={() => router.back()} className='mb-4'>
        Back
      </Button>
      <h1 className='text-3xl font-bold mb-4'>{product.title}</h1>
      <p className='text-gray-700 mb-4'>{product.description}</p>
      <p className='text-xl font-semibold mb-4'>${product.price.toFixed(2)}</p>
      {product.dimensions && (
        <p className='mb-4'>Dimensions: {product.dimensions}</p>
      )}
      {product.images && product.images.length > 0 && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {product.images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Product Image ${index + 1}`}
              className='w-full object-cover rounded'
            />
          ))}
        </div>
      )}
      <div className='mt-4 space-y-4'>
        {cartItem ? (
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() =>
                updateItemQuantity(cartItem.id, cartItem.quantity - 1)
              }
              disabled={cartItem.quantity <= 1}
            >
              –
            </Button>
            <span className='font-semibold'>{cartItem.quantity}</span>
            <Button
              onClick={() =>
                updateItemQuantity(cartItem.id, cartItem.quantity + 1)
              }
            >
              +
            </Button>
          </div>
        ) : (
          <Button
            onClick={() =>
              addItem({
                id: product._id,
                title: product.title,
                price: product.price,
              })
            }
          >
            Add to Cart
          </Button>
        )}

        {/* "Go to Cart" Button */}
        <Button variant='secondary' onClick={() => router.push('/cart')}>
          Go to Cart
        </Button>
      </div>
    </div>
  );
}
