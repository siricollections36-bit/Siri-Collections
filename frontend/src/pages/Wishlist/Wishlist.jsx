import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const { wishlistItems = [], toggleWishlist, wishlistCount = 0 } = useWishlist();
  const { addToCart } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    const productId = product._id || product.id;
    addToCart({
      ...product,
      id: productId,
      quantity: 1,
    });
    // Remove from wishlist after moving to cart
    toggleWishlist(product);
    show(`${product.name} moved to cart`, 'success');
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
    show('Removed from your heart list', 'info');
  };

  // Animation variants for individual items
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  if (!wishlistItems) return null;

  return (
    <div className={styles.wishlistPage}>
      {/* HEADER SECTION */}
      <header className={styles.header}>
        <h1 className={styles.title}>My Wishlist</h1>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
        <p className={styles.subtitle}>
          {wishlistCount} {wishlistCount === 1 ? 'Saree' : 'Sarees'} saved for later
        </p>
      </header>

      <div className={styles.container}>
        <AnimatePresence mode="popLayout">
          {wishlistItems.length === 0 ? (
            /* 2. EMPTY STATE */
            <motion.div 
              key="empty" 
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={styles.emptyIcon}>♡</div>
              <h2>Your heart list is empty</h2>
              <p>Sign in to sync your wishlist across all your devices.</p>
              <button onClick={() => navigate('/shop')} className={styles.shopNowBtn}>
                Discover Sarees
              </button>
            </motion.div>
          ) : (
            /* 3. RESPONSIVE GRID */
            <div className={styles.wishlistGrid}>
              {wishlistItems.map((product) => (
                <motion.div
                  key={product._id || product.id}
                  className={styles.wishlistItem}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  layout
                >
                  <div className={styles.productWrapper}>
                    <ProductCard product={product} />
                  </div>

                  {/* HOVER OVERLAY (Desktop only - hidden on mobile via CSS) */}
                  <div className={styles.actionOverlay}>
                    <button
                      className={styles.moveToCartBtn}
                      onClick={() => handleMoveToCart(product)}
                    >
                      Move to Cart
                    </button>
                  </div>
                  
                  {/* MOBILE ACTION BUTTON (Visible only on mobile) */}
                  <button 
                    className={styles.mobileMoveBtn}
                    onClick={() => handleMoveToCart(product)}
                  >
                    Move to Cart
                  </button>

                  {/* REMOVE BUTTON (Always reachable) */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(product)}
                    aria-label="Remove from wishlist"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {wishlistItems.length > 0 && (
          <div className={styles.footer}>
            <Link to="/shop" className={styles.continueLink}>
               ← Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}