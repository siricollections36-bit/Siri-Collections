import { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import api from '../utils/api'; 
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const CART_KEY = 'siri_cart_storage';

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      const fetchCartFromDB = async () => {
        try {
          const res = await api.get(`/auth/cart/${user.id || user._id}`);
          if (res.data) {
            const formatted = res.data.map(item => ({
              ...item.product,
              quantity: item.quantity,
              _id: item.product?._id,
              id: item.product?._id 
            }));
            setItems(formatted);
          }
        } catch (err) { console.error("Cart Fetch Failed"); }
        finally { setHasFetchedInitial(true); }
      };
      fetchCartFromDB();
    } else {
      setItems([]);
      setHasFetchedInitial(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || !hasFetchedInitial || authLoading) return;
    const syncWithDB = async () => {
      try {
        const cartData = items.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity
        }));
        // URL FIXED
        await api.post('/auth/cart/sync', {
          userId: user.id || user._id,
          cartItems: cartData
        });
      } catch (err) { console.error("Cart sync failed", err); }
    };
    const timer = setTimeout(syncWithDB, 1000);
    return () => clearTimeout(timer);
  }, [items, user, hasFetchedInitial, authLoading]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const pId = product._id || product.id;
      const existing = prev.find((i) => (i._id || i.id) === pId);
      if (existing) {
        return prev.map((i) => (i._id || i.id) === pId ? { ...i, quantity: i.quantity + Number(quantity) } : i);
      }
      return [...prev, { ...product, quantity: Number(quantity) }];
    });
  };

 const updateQuantity = (pId, newQty) => {
    if (newQty < 1) {
      removeFromCart(pId);
      return;
    }
    setItems((prev) => prev.map((i) => ((i._id || i.id) === pId ? { ...i, quantity: newQty } : i)));
  };

  const removeFromCart = (pId) => setItems((prev) => prev.filter((i) => (i._id || i.id) !== pId));
  const clearCart = () => setItems([]);
  const isInCart = (pId) => items.some((i) => (i._id || i.id) === pId);

  const { cartSubtotal, shippingFee, cartTotal, cartCount } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const fee = (subtotal === 0 || subtotal >= 999) ? 0 : 120;
    return { cartSubtotal: subtotal, shippingFee: fee, cartTotal: subtotal + fee, cartCount: count };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isInCart, cartCount, cartSubtotal, shippingFee, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
