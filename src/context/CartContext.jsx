'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Define the shape of a cart item
// You can extend this interface as needed
// For example: { id, title, price, quantity, image, etc. }
const initialCartState = {
  items: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const item = action.payload;
      // Check if the item already exists
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        // Increase quantity if exists
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      } else {
        // Otherwise, add the item with initial quantity 1
        return {
          ...state,
          items: [...state.items, { ...item, quantity: 1 }],
        };
      }
    }
    case 'REMOVE_ITEM': {
      const itemId = action.payload;
      return {
        ...state,
        items: state.items.filter((i) => i.id !== itemId),
      };
    }
    case 'UPDATE_ITEM_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity zero or less
        return {
          ...state,
          items: state.items.filter((i) => i.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
      };
    }
    case 'CLEAR_CART': {
      return { items: [] };
    }
    case 'SET_CART': {
      return { items: action.payload };
    }
    default:
      return state;
  }
}

const CartContext = createContext();

export function CartProvider({ children }) {
  // Try to load persisted cart from localStorage (if exists)
  const [state, dispatch] = useReducer(
    cartReducer,
    initialCartState,
    (initial) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cart');
        return stored ? JSON.parse(stored) : initial;
      }
      return initial;
    }
  );

  // Persist the cart whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateItemQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_ITEM_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
