import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../../../components/ProductCard/ProductCard.jsx';
import styles from './BestSellers.module.css';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        // Handle paginated or flat data
        const allProducts = res.data.products || res.data;
        
        // Filter logic: Check both boolean and string versions
        const filtered = allProducts.filter(p => 
          String(p.isBestSeller) === 'true'
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Home: Error loading best sellers", err);
      }
    };
    fetchBestSellers();
  }, []);

  const scroll = (direction) => {
    if (direction === 'left') scrollRef.current.scrollLeft -= 300;
    else scrollRef.current.scrollLeft += 300;
  };

  // If you haven't ticked any "Best Seller" boxes in Admin, this hides the section.
  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.subtitle}>CURATED FOR YOU</span>
            <h2 className={styles.title}>Best Sellers</h2>
          </div>
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} onClick={() => scroll('left')}>←</button>
            <button className={styles.arrowBtn} onClick={() => scroll('right')}>→</button>
          </div>
        </div>

        <div className={styles.sliderContainer} ref={scrollRef}>
          {products.map(product => (
            <div key={product._id} className={styles.cardWrapper}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}