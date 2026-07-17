import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'siri_cart';

export function CartProvider({ children }) {
  // --- THE FIX FOR REFRESH: Lazy Initializer ---
  // This runs immediately upon app start, preventing the 'empty array overwrite' bug
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      return [];
    }
  });

  // Sync state to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Helper to handle both MongoDB _id and legacy local id
  const getID = (item) => item._id || item.id;

  /**
   * ADD TO CART
   * Handles stock limits and treats 0/empty as unlimited (9999)
   */
  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const productId = getID(product);
      const existing = prev.find((i) => getID(i) === productId);

      // Treat stock 0, null, or undefined as Unlimited (9999)
      const stockLimit = (!product.stock || Number(product.stock) === 0) 
                         ? 9999 : Number(product.stock);

      if (existing) {
        const newQty = existing.quantity + Number(quantity);
        // Ensure we don't exceed the stock limit
        const finalQty = Math.min(newQty, stockLimit);
        return prev.map((i) => getID(i) === productId ? { ...i, quantity: finalQty } : i);
      }
      
      // New item being added
      return [
        ...prev, 
        { 
          ...product, 
          id: productId, 
          quantity: Math.min(Number(quantity), stockLimit), 
          price: Number(product.price),
          stock: product.stock // Carry the stock value for Cart UI checks
        }
      ];
    });
  };

  /**
   * UPDATE QUANTITY
   * Enforces floor of 1 and ceiling of stock limit
   */
  const updateQuantity = (productId, newQuantity) => {
    setItems((prev) =>
      prev.map((i) => {
        if (getID(i) === productId) {
          // 1. Never allow less than 1
          let validatedQty = Math.max(1, newQuantity);
          
          // 2. Never allow more than available stock (unless 0/empty)
          const stockLimit = (!i.stock || Number(i.stock) === 0) 
                             ? 9999 : Number(i.stock);

          if (validatedQty > stockLimit) {
            validatedQty = stockLimit;
          }
          
          return { ...i, quantity: Number(validatedQty) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => getID(i) !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  };

  const isInCart = (productId) => items.some((i) => getID(i) === productId);

  /**
   * CENTRALIZED CALCULATIONS (Scalability)
   * This logic is computed once here and shared by Cart and Checkout pages.
   */
  const { cartSubtotal, shippingFee, cartTotal, cartCount } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    
    // Shipping Rule: Free if >= 999, else 99
    const fee = subtotal === 0 ? 0 : 120;
    
    return {
      cartSubtotal: subtotal,
      shippingFee: fee,
      cartTotal: subtotal + fee,
      cartCount: count
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        isInCart, 
        cartCount, 
        cartSubtotal, 
        shippingFee, 
        cartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};