import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  gstAmount: number;
  total: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionId = localStorage.getItem('sv-session-id') || crypto.randomUUID();
  if (!localStorage.getItem('sv-session-id')) {
    localStorage.setItem('sv-session-id', sessionId);
  }

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      let query = supabase
        .from('cart_items')
        .select('id, quantity, product:products(*)');

      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const cartItems = (data || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        product: item.product as Product,
      }));
      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, quantity = 1) => {
    const existing = items.find((item) => item.product.id === product.id);

    if (existing) {
      await updateQuantity(existing.id, existing.quantity + quantity);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          product_id: product.id,
          quantity,
        })
        .select('id, quantity, product:products(*)')
        .single();

      if (error) throw error;

      setItems((prev) => [...prev, {
        id: data.id,
        quantity: data.quantity,
        product: data.product as Product,
      }]);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      if (error) throw error;
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      let query = supabase.from('cart_items').delete();
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('session_id', sessionId);
      }
      await query;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gstAmount = items.reduce((sum, item) => {
    const gstRate = item.product.gst_rate / 100;
    const itemTotal = item.product.price * item.quantity;
    return sum + itemTotal * gstRate;
  }, 0);
  const total = subtotal + gstAmount;

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, subtotal, gstAmount, total, loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
