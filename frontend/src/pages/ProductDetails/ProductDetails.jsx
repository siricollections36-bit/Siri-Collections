import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader/Loader';
import { formatPrice } from '../../utils/formatters';
import styles from './ProductDetails.module.css';

export default function ProductDetails() {
  const { slug } = useParams(); 
  const { addToCart } = useCart();
  const { show } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0); 
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products/${slug}`);
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
   * STOCK VALIDATION LOGIC
   * Prevents adding more than available stock
   */
  const handleAddToCart = () => {
    if (!product || product.stock <= 0) {
      show("Sorry, this item is currently out of stock", "error");
      return;
    }

    if (quantity > product.stock) {
      show(`Only ${product.stock} items available in stock`, "error");
      return;
    }
    
    addToCart({
      ...product,
      id: product._id, 
      quantity: quantity,
      stock: product.stock // Pass stock count to cart for further validation
    });
    
    show(`${product.name} added to bag`, "success");
  };

  if (loading) return <Loader fullPage />;
  if (!product) return <div className={styles.notFound}>Product Not Found</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.name}</span>
      </nav>

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
          
          <div className={styles.descriptionArea}>
            <h3>Description</h3>
            <p className={styles.description}>
              {product.description || "Experience timeless elegance with this handcrafted piece from Siri Textiles. Expertly woven using traditional techniques, this item features intricate patterns and premium fabric quality."}
            </p>
          </div>

          <div className={styles.metaData}>
            <p><strong>Fabric:</strong> {product.fabric || 'Pure Premium Quality'}</p>
            <p><strong>Product Code:</strong> {product.sku || 'ST-WEB-001'}</p>
            
            <p>
              <strong>Availability:</strong> 
              {product.stock > 0 ? (
                <span className={styles.inStock}>✓ In Stock</span>
              ) : (
                <span className={styles.outOfStock}>✕ Out of Stock</span>
              )}
            </p>
            
            {/* Show urgency message if stock is low (Optional Scalability feature) */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className={styles.lowStockWarning}>🔥 Hurry! Only {product.stock} left in stock.</p>
            )}
          </div>

          {/* PURCHASE ACTIONS */}
          <div className={styles.actionRow}>
            <div className={styles.quantitySelector}>
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >−</button>
              
              <span>{quantity}</span>
              
              <button 
                onClick={() => setQuantity(q => q + 1)}
                // THE FIX: Disable button when reaching stock limit
                disabled={quantity >= product.stock}
              >+</button>
            </div>

            <button 
              className={styles.addToCartBtn} 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
            </button>
          </div>

          <div className={styles.trustMarkers}>
             <p>✓ 100% Authentic Handcrafted Saree</p>
             <p>✓ Secure Razorpay Checkout</p>
          </div>
        </div>

      </div>
    </div>
  );
}