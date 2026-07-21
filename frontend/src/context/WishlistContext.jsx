import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const WISHLIST_KEY = 'siri_wishlist_storage';

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  
  // Initialize: Users load saved list, Guests always start empty on refresh
  const [wishlistItems, setWishlistItems] = useState(() => {
    const hasUser = localStorage.getItem('user');
    if (hasUser) {
      const saved = localStorage.getItem(WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const fetchWishlist = async () => {
        try {
          const res = await api.get(`/auth/wishlist/${user.id || user._id}`);
          if (res.data) {
            setWishlistItems(res.data);
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Wishlist Database Fetch Failed");
        }
      };
      fetchWishlist();
    } else {
      // Confirm Guest: Wipe storage
      setWishlistItems([]);
      localStorage.removeItem(WISHLIST_KEY);
    }
  }, [user, authLoading]);

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const isAlreadyThere = wishlistItems.some(i => (i._id || i.id) === productId);

    let updatedList;
    if (isAlreadyThere) {
      updatedList = wishlistItems.filter(i => (i._id || i.id) !== productId);
    } else {
      updatedList = [...wishlistItems, product];
    }

    setWishlistItems(updatedList);
    
    // If logged in, sync to both localStorage (for refresh) and Database
    if (localStorage.getItem('user')) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedList));
      if (user) {
        try {
          await api.post('/auth/wishlist/toggle', {
            userId: user.id || user._id,
            productId
          });
        } catch (err) {
          console.error("Wishlist Database Sync Failed");
        }
      }
    }
  };

  const isWishlisted = (productId) => wishlistItems.some(i => (i._id || i.id) === productId);

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      toggleWishlist, 
      isWishlisted, 
      wishlistCount: wishlistItems.length 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};