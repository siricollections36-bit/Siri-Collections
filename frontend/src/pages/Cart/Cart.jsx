import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import styles from './Cart.module.css';

export default function Cart() {
  // Pulling centralized totals and functions from context
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    cartSubtotal, 
    shippingFee, 
    cartTotal 
  } = useCart();

  const { show } = useToast(); 
  const navigate = useNavigate();

  const handleRemove = (id) => {
    removeFromCart(id);
    show('Item removed from cart', 'info');
  };

  // Animation settings for list items
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, scale: 0.95 },
  };

  // 1. EMPTY STATE UI
  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✦</div>
          <h1>Your Cart is Empty</h1>
          <p>Discover our beautiful collection of premium sarees.</p>
          <button 
            onClick={() => navigate('/shop')} 
            className={styles.checkoutBtn} 
            style={{ width: 'auto', padding: '12px 40px', marginTop: '20px' }}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={styles.cartPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className={styles.title}>Shopping Cart</h1>

      <div className={styles.container}>
        {/* LEFT: Items List */}
        <div className={styles.cartItems}>
          <AnimatePresence mode='popLayout'>
            {items.map((item) => {
              const itemId = item._id || item.id; 
              
              /**
               * REAL-TIME STOCK LOGIC:
               * We only treat the item as 'Limited' if the admin entered a number GREATER than 0.
               * If stock is 0, empty string, or null, it is treated as Unlimited.
               */
              const isLimited = item.stock && Number(item.stock) > 0;
              const stockLimit = isLimited ? Number(item.stock) : 9999;

              return (
                <motion.div
                  key={itemId}
                  className={styles.cartItem}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <div className={styles.itemImage}>
                    <img src={item.images?.[0] || item.image} alt={item.name} />
                  </div>

                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemCategory}>{item.category || 'Saree'}</p>
                    {item.fabric && <p className={styles.itemMeta}>Fabric: {item.fabric}</p>}
                  </div>

                  <div className={styles.itemPrice}>
                    <span>{formatPrice(item.price)}</span>
                  </div>

                  {/* QUANTITY SECTION WITH SMART LIMITS */}
                  <div className={styles.itemQuantity}>
                    <div className={styles.qtyBox}>
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      
                      <div className={styles.qtyValueWrapper}>
                        <span className={styles.qty}>{item.quantity}</span>
                        {/* Only show 'Limit Reached' if there is a real positive limit set */}
                        {isLimited && item.quantity >= stockLimit && (
                          <small className={styles.limitReached}>Limit reached</small>
                        )}
                      </div>

                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        // Plus button disabled only if a real limit is reached
                        disabled={isLimited && item.quantity >= stockLimit}
                      >+</button>
                    </div>
                  </div>

                  <div className={styles.itemTotal}>
                    {formatPrice(Number(item.price) * item.quantity)}
                  </div>

                  <button className={styles.removeBtn} onClick={() => handleRemove(itemId)}>✕</button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* RIGHT: Order Summary Sidebar */}
        <aside className={styles.summary}>
          <h2>Order Summary</h2>

          <div className={styles.priceBreakdown}>
            <div className={styles.breakdownRow}>
              <span>Subtotal</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>

            <div className={styles.breakdownRow}>
              <span>Shipping</span>
              {shippingFee === 0 ? (
                <span className={styles.freeShipping}>FREE</span>
              ) : (
                <span>{formatPrice(shippingFee)}</span>
              )}
            </div>

            <div className={styles.breakdownDivider} />

            <div className={`${styles.breakdownRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>

          <div className={styles.summaryActions}>
            <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
              PROCEED TO CHECKOUT
            </button>
            
            {/* ADDED: Continue Shopping Button */}
            <button className={styles.continueBtn} onClick={() => navigate('/shop')}>
              CONTINUE SHOPPING
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}