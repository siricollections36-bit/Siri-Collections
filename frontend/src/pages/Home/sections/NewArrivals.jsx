import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from '../../../components/ProductCard/ProductCard.jsx';
import styles from './NewArrivals.module.css';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null); // Reference for the horizontal scroll

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        // Support both paginated {products: []} and flat array data
        const allData = res.data.products || res.data;

        /**
         * SCALABILITY FIX:
         * 1. Filter by 'isNewArrival' (renamed from 'isNew' to avoid Mongoose conflicts)
         * 2. Handle both boolean and string "true" from database
         */
        const filtered = allData.filter(p => 
          String(p.isNewArrival) === 'true'
        );
        
        setProducts(filtered);
      } catch (err) {
        console.error("Home: Error loading new arrivals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  // SCROLL LOGIC FOR SIDE ARROWS
  const scroll = (direction) => {
    const { current } = scrollRef;
    const scrollAmount = 330; // Card width + gap
    if (direction === 'left') {
      current.scrollLeft -= scrollAmount;
    } else {
      current.scrollLeft += scrollAmount;
    }
  };

  // If no products are marked as 'New Arrival' in Admin, hide the section
  if (!loading && products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.subtitle}>LATEST ADDITIONS</span>
            <h2 className={styles.title}>New Arrivals</h2>
          </div>
          
          {/* NAVIGATION ARROWS */}
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} onClick={() => scroll('left')} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className={styles.arrowBtn} onClick={() => scroll('right')} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        {/* THE SLIDER CONTAINER */}
        <div className={styles.sliderContainer} ref={scrollRef}>
          {loading ? (
            <p>Fetching newest styles...</p>
          ) : (
            products.map(product => (
              <div key={product._id} className={styles.cardWrapper}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}