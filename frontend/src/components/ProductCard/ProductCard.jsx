import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { show } = useToast();

  // MongoDB uses _id. We pass the whole product but ensure ID logic uses _id
  const productId = product._id; 

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevents navigating to product page
    e.stopPropagation();
    
    // Add to cart logic
    addToCart({ ...product, id: productId }); 
    show(`${product.name} added to cart`, 'success');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ ...product, id: productId });
    show(
      isWishlisted(productId)
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`,
      'success'
    );
  };

  // Safe image handling
  const mainImg = product.images && product.images[0] ? product.images[0] : '/placeholder.png';
  const hoverImg = product.images && product.images[1] ? product.images[1] : mainImg;
  const currentImg = hovered ? hoverImg : mainImg;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* LINK TO PRODUCT DETAILS USING MONGODB _ID */}
      <Link to={`/product/${productId}`} className={styles.imageWrap}>
        <img
          src={currentImg}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        
        {/* BADGES */}
        {product.discount > 0 && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}
        {product.isNew && <span className={styles.newBadge}>NEW</span>}
        
        <button
          className={`${styles.wishlistBtn} ${isWishlisted(productId) ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          {isWishlisted(productId) ? '♥' : '♡'}
        </button>
      </Link>

      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <Link to={`/product/${productId}`} className={styles.name}>
          {product.name}
        </Link>
        
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {/* STRIKETHROUGH ORIGINAL PRICE */}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* ADD TO CART BUTTON */}
        <button
          className={`${styles.addBtn} ${isInCart(productId) ? styles.inCart : ''}`}
          onClick={handleAddToCart}
          disabled={product.availability === 'Out of Stock'}
        >
          {isInCart(productId) ? 'ADDED ✓' : 'ADD TO CART'}
        </button>
      </div>
    </motion.div>
  );
}