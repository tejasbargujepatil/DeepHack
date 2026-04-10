import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) { setCart([]); return; }
    setCartLoading(true);
    try {
      const { data } = await userService.getCart();
      setCart(data.data || []);
    } catch {} finally { setCartLoading(false); }
  };

  const fetchWishlist = async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const { data } = await userService.getWishlist();
      setWishlist(data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [user]);

  const addToCart = async (payload) => {
    // Accept both (productId, qty) and ({ productId, quantity })
    const body = typeof payload === 'object' ? payload : { productId: payload, quantity: 1 };
    await userService.addToCart(body);
    await fetchCart();
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) { await removeFromCart(productId); return; }
    // Re-use addToCart with absolute qty — backend does upsert so we set directly
    await userService.addToCart({ productId, quantity });
    setCart(prev => prev.map(i =>
      (i.productId === productId || i.product?.id === productId)
        ? { ...i, quantity } : i
    ));
  };

  const removeFromCart = async (productId) => {
    await userService.removeFromCart(productId);
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const toggleWishlist = async (productId) => {
    const inWishlist = wishlist.some(i => i.productId === productId);
    if (inWishlist) {
      await userService.removeFromWishlist(productId);
      setWishlist(prev => prev.filter(i => i.productId !== productId));
    } else {
      await userService.addToWishlist({ productId });
      await fetchWishlist();
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * Number(item.product?.price || 0), 0);
  const inWishlist = (productId) => wishlist.some(i => i.productId === productId);

  return (
    <CartContext.Provider value={{
      cart, wishlist,
      loading: cartLoading, cartLoading,
      cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity,
      toggleWishlist, inWishlist, fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
