import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api'; 
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader/Loader';
import { formatPrice } from '../../utils/formatters';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
  const { slug } = useParams(); 
  const navigate = useNavigate(); 
  const { addToCart } = useCart();
  const { show } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0); 
  const [quantity, setQuantity] = useState(1);
  const [isDescOpen, setIsDescOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
        setActiveImg(0); 
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  /**
   * SMART BACK LOGIC
   * Preserves filters by going back in history, 
   * or defaults to /shop if no history exists.
   */
  const handleSmartBack = () => {
    // window.history.state.idx > 0 means the user has 
    // navigated within our app to get here.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // If they landed here directly from a link, take them to the Shop
      navigate('/shop');
    }
  };

  const handleAddToCart = () => {
    if (quantity === 0) return show("Please select at least 1 item", "error"); // Added this line
    if (!product || product.stock <= 0) {
      show("Sorry, this item is currently out of stock", "error");
      return;
    }
    if (quantity > product.stock) {
      show(`Only ${product.stock} items available in stock`, "error");
      return;
    }
    addToCart(product, quantity);
    show(`${product.name} added to bag`, "success");
  };

  if (loading) return <Loader fullPage />;
  if (!product) return <div className={styles.notFound}>Product Not Found</div>;

  return (
    <div className={styles.container}>
      {/* TOP NAVIGATION ROW */}
      <div className={styles.topNavigation}>
        <button className={styles.backBtn} onClick={handleSmartBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Shop
        </button>
        
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
        </nav>
      </div>

      <div className={styles.mainGrid}>
        
        {/* LEFT: IMAGE GALLERY */}
        <div className={styles.gallerySection}>
          <div className={styles.thumbnails}>
            {product.images?.map((img, i) => (
              <div 
                key={i} 
                className={`${styles.thumbWrapper} ${activeImg === i ? styles.activeThumb : ''}`}
                onMouseEnter={() => setActiveImg(i)}
              >
                <img src={img} alt={`${product.name} view ${i}`} />
              </div>
            ))}
          </div>

          <div className={styles.mainImageDisplay}>
            <img 
              src={product.images?.[activeImg]} 
              alt={product.name} 
              className={styles.mainImg} 
            />
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className={styles.infoSection}>
          <p className={styles.categoryBadge}>{product.category}</p>
          <h1 className={styles.title}>{product.name}</h1>
          
          <div className={styles.priceRow}>
             <span className={styles.price}>{formatPrice(product.price)}</span>
             {product.originalPrice && product.originalPrice > product.price && (
               <span className={styles.oldPrice}>{formatPrice(product.originalPrice)}</span>
             )}
          </div>

          <div className={styles.divider} />
          
          <div className={styles.metaData}>
            <p className={styles.infoLine}><strong>Fabric:</strong> {product.fabric || 'Pure Premium Quality'}</p>
            <p className={styles.infoLine}><strong>Product Code:</strong> {product.sku || 'ST-WEB-001'}</p>
            
            <p className={styles.infoLine}>
              <strong>Availability:</strong> 
              {product.stock > 0 ? (
                <span className={styles.inStock}>✓ In Stock</span>
              ) : (
                <span className={styles.outOfStock}>✕ Out of Stock</span>
              )}
            </p>
          </div>

          <div className={styles.actionRow}>
            <div className={styles.quantitySelector}>
<button onClick={() => setQuantity(q => Math.max(0, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} disabled={quantity >= product.stock}>+</button>
            </div>

            <button 
              className={styles.addToCartBtn} 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
            </button>
          </div>

          <div className={styles.dropdownSection}>
            <button 
              className={styles.dropdownHeader} 
              onClick={() => setIsDescOpen(!isDescOpen)}
            >
              <span>Description</span>
              <span className={`${styles.chevron} ${isDescOpen ? styles.chevronOpen : ''}`}>▾</span>
            </button>
            
            {isDescOpen && (
              <div className={styles.dropdownContent}>
                <p className={styles.description}>
                  {product.description || "Experience timeless elegance with this handcrafted piece from Siri Collections."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
