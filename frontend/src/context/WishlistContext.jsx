import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]); // ALWAYS start with empty array
  const { user } = useAuth();

  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          // Change this URL if your backend port is different
          const res = await axios.get(`http://localhost:5000/api/auth/wishlist/${user.id || user._id}`);
          // Ensure we only set the state if data is an array
          setWishlistItems(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Cloud Wishlist Fetch Failed");
          setWishlistItems([]); 
        }
      } else {
        const stored = localStorage.getItem('siri_wishlist');
        setWishlistItems(stored ? JSON.parse(stored) : []);
      }
    };
    loadWishlist();
  }, [user]);

  // Sync to local storage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('siri_wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    
    // Optimistic UI update (makes the site feel fast)
    const isAlreadyThere = wishlistItems.some(item => (item._id || item.id) === productId);
    if (isAlreadyThere) {
      setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
    } else {
      setWishlistItems(prev => [...prev, product]);
    }

    if (user) {
      try {
        await axios.post('http://localhost:5000/api/auth/wishlist/toggle', {
          userId: user.id || user._id,
          productId: productId
        });
      } catch (err) {
        console.error("Backend wishlist sync failed");
      }
    }
  };

  const isWishlisted = (productId) => {
    return wishlistItems?.some(item => (item._id || item.id) === productId) || false;
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems: wishlistItems || [], // Force fallback to empty array
      toggleWishlist, 
      isWishlisted, 
      wishlistCount: wishlistItems?.length || 0 
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