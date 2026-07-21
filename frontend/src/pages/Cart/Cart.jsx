import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import styles from './Cart.module.css';

// Items per page limit
const ITEMS_PER_PAGE = 4;

export default function Cart() {
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

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pages
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  
  // Get current items slice
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Auto-adjust page if item deletion makes current page empty
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [items.length, totalPages, currentPage]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    show('Item removed from cart', 'info');
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  };

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✦</div>
          <h1>Your Cart is Empty</h1>
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
      <div className={styles.container}>
        <h1 className={styles.title}>Shopping Cart</h1>

        <div className={styles.mainGrid}>
          {/* LEFT: Items List */}
          <div className={styles.leftSide}>
            <div className={styles.cartItems}>
              <AnimatePresence mode='popLayout'>
                {paginatedItems.map((item) => {
                  const itemId = item._id || item.id; 
                  const hasRealLimit = item.stock !== undefined && item.stock !== null && item.stock !== "" && Number(item.stock) > 0;
                  const availableStock = hasRealLimit ? Number(item.stock) : 9999;

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
                        <div className={styles.mobilePrice}>{formatPrice(item.price)}</div>
                      </div>

                      <div className={styles.itemPriceDesk}>
                        <span>{formatPrice(item.price)}</span>
                      </div>

                      <div className={styles.itemQuantity}>
                        <div className={styles.qtyBox}>
                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >−</button>
                          
                          <div className={styles.qtyValueWrapper}>
                            <span className={styles.qty}>{item.quantity}</span>
                            {hasRealLimit && item.quantity >= availableStock && (
                              <small className={styles.limitReached}>LIMIT REACHED</small>
                            )}
                          </div>

                          <button 
                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                            disabled={hasRealLimit && item.quantity >= availableStock}
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

            {/* --- PAGINATION CONTROLS --- */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹ Previous
                </button>
                
                <div className={styles.pageNumbers}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary */}
          <aside className={styles.summary}>
            <h2>Order Summary</h2>
            <div className={styles.priceBreakdown}>
              <div className={styles.breakdownRow}>
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>Shipping</span>
                {shippingFee === 0 ? <span className={styles.freeShipping}>FREE</span> : <span>{formatPrice(shippingFee)}</span>}
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
              <button className={styles.continueBtn} onClick={() => navigate('/shop')}>
                CONTINUE SHOPPING
              </button>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}