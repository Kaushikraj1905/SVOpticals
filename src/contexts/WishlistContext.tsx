import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localWishlist, setLocalWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sv-opticals-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sv-opticals-wishlist', JSON.stringify(localWishlist));
  }, [localWishlist]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product:products(*)')
        .eq('user_id', user!.id);

      if (error) throw error;
      setItems((data || []).map((item: any) => item.product as Product));
      setLocalWishlist((data || []).map((item: any) => item.product.id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product) => {
    if (!user) {
      setLocalWishlist((prev) => {
        if (prev.includes(product.id)) return prev;
        return [...prev, product.id];
      });
      setItems((prev) => {
        if (prev.find((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: product.id });
      if (error) throw error;
      setItems((prev) => {
        if (prev.find((p) => p.id === product.id)) return prev;
        return [...prev, product];
      });
      setLocalWishlist((prev) => {
        if (prev.includes(product.id)) return prev;
        return [...prev, product.id];
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) {
      setLocalWishlist((prev) => prev.filter((id) => id !== productId));
      setItems((prev) => prev.filter((p) => p.id !== productId));
      return;
    }
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
      setItems((prev) => prev.filter((p) => p.id !== productId));
      setLocalWishlist((prev) => prev.filter((id) => id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    if (user) {
      return items.some((p) => p.id === productId);
    }
    return localWishlist.includes(productId);
  };

  const clearWishlist = async () => {
    if (!user) {
      setLocalWishlist([]);
      setItems([]);
      return;
    }
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setItems([]);
      setLocalWishlist([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isInWishlist, clearWishlist, loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
