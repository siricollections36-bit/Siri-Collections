import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api'; 
import CategoryCard from '../../components/CategoryCard/CategoryCard.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import styles from './Collections.module.css';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH LIVE DATA FROM BACKEND
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/categories');
        setCollections(res.data);
      } catch (err) {
        console.error("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) return <Loader fullPage />;

  return (
    <motion.div 
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Our Collections</h1>
          <p className={styles.subtitle}>Discover our curated selection of premium sarees</p>
        </div>
      </header>

      <section className={styles.gridSection}>
        <div className={styles.container}>
          {collections.length === 0 ? (
            <div className={styles.empty}>
              <h3>No collections available at the moment.</h3>
            </div>
          ) : (
            <div className={styles.grid}>
              {collections.map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US SECTION (Static Brand Values) */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Choose Our Collections?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.icon}>✓</div>
              <h4>Authentic Sourcing</h4>
              <p>Every saree is sourced directly from master weavers across India.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>✓</div>
              <h4>Quality Assured</h4>
              <p>Our rigorous quality checks ensure each piece meets our standards.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>✓</div>
              <h4>Diverse Range</h4>
              <p>From traditional silk to contemporary designs, we offer options for every occasion.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>✓</div>
              <h4>Expert Styling</h4>
              <p>Our style experts are always available to help you choose the perfect saree.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}