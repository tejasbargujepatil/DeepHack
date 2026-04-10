import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]); // array of product IDs

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const { data } = await userService.getWishlist();
      const items = data.data || [];
      setWishlist(items.map(i => i.productId || i.product?.id || i.id));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const isInWishlist = (productId) => wishlist.includes(productId);

  const toggle = async (productId) => {
    if (!user) { toast.error('Sign in to save to wishlist'); return; }
    const isIn = isInWishlist(productId);
    if (isIn) {
      setWishlist(prev => prev.filter(id => id !== productId));
      try {
        await userService.removeFromWishlist(productId);
        toast('Removed from wishlist', { icon: '💔' });
      } catch {
        setWishlist(prev => [...prev, productId]); // rollback
        toast.error('Failed to update wishlist');
      }
    } else {
      setWishlist(prev => [...prev, productId]);
      try {
        await userService.addToWishlist({ productId });
        toast.success('Added to wishlist ❤️');
      } catch {
        setWishlist(prev => prev.filter(id => id !== productId)); // rollback
        toast.error('Failed to update wishlist');
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggle, fetchWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
