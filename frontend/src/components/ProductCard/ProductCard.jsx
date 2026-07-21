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
const { addToCart, items, updateQuantity, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { show } = useToast();

  // MongoDB uses _id. We pass the whole product but ensure ID logic uses _id
  const productId = product._id; 
  // Find this specific item in the cart to get its current quantity
  const cartItem = items.find(i => (i._id || i.id) === productId);

  const handleQtyChange = (e, delta) => {
    e.preventDefault();
    e.stopPropagation();
    const currentQty = cartItem?.quantity || 0;
    const newQty = currentQty + delta;
    updateQuantity(productId, newQty);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.availability === 'Out of Stock') return;
    
    addToCart(product, 1); 
    show(`${product.name} added to bag`, 'success');
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
       <div className={styles.buttonWrapper}>
          {isInCart(productId) ? (
            <div className={styles.qtySelector}>
              <button className={styles.qtyBtn} onClick={(e) => handleQtyChange(e, -1)}>−</button>
              <span className={styles.qtyValue}>{cartItem?.quantity}</span>
              <button 
                className={styles.qtyBtn} 
                onClick={(e) => handleQtyChange(e, 1)}
                disabled={cartItem?.quantity >= product.stock}
              >+</button>
            </div>
          ) : (
            <button
              className={styles.addBtn}
              onClick={handleAddToCart}
              disabled={product.availability === 'Out of Stock' || product.stock <= 0}
            >
              {product.availability === 'Out of Stock' ? 'OUT OF STOCK' : 'ADD TO BAG'}
            </button>
          )}
        </div>
      
    </motion.div>
  );
}
