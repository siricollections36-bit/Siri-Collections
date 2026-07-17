import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './Wishlist.module.css';

export default function Wishlist() {
  const { wishlistItems = [], toggleWishlist, wishlistCount = 0 } = useWishlist();
  const { addToCart } = useCart();
  const { show } = useToast();

  const handleMoveToCart = (product) => {
    const productId = product._id || product.id;
    addToCart({
      ...product,
      id: productId,
      quantity: 1,
    });
    toggleWishlist(product);
    show(`${product.name} moved to cart`, 'success');
  };

  const handleRemove = (product) => {
    toggleWishlist(product);
    show('Removed from wishlist', 'info');
  };

  // Animation Variants
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9 }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1 } // Triggered by parent whileHover="hover"
  };

  if (!wishlistItems) return null;

  return (
    <div className={styles.wishlistPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Wishlist</h1>
        <p className={styles.subtitle}>{wishlistCount} items in your heart list</p>
      </header>

      <div className={styles.container}>
        <AnimatePresence mode="popLayout">
          {wishlistItems.length === 0 ? (
            <motion.div key="empty" className={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.emptyIcon}>♡</div>
              <h2>Wishlist is empty</h2>
              <Link to="/shop" className={styles.shopButton}>Explore Collection</Link>
            </motion.div>
          ) : (
            <div className={styles.wishlistGrid}>
              {wishlistItems.map((product) => (
                <motion.div
                  key={product._id || product.id}
                  className={styles.wishlistItem}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover" // This triggers children variants
                  layout
                >
                  {/* The standard product card */}
                  <div className={styles.productWrapper}>
                    <ProductCard product={product} />
                  </div>

                  {/* THE HOVER OVERLAY */}
                  <motion.div 
                    className={styles.actionOverlay}
                    variants={overlayVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className={styles.moveToCartBtn}
                      onClick={() => handleMoveToCart(product)}
                    >
                      Move to Cart
                    </button>
                    
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(product)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}