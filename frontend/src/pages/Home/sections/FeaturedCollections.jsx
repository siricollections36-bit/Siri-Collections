import { useState, useEffect } from 'react'; // 1. Added Hooks
import { motion } from 'framer-motion';
import api from '../../../utils/api'; 

import CategoryCard from '../../../components/CategoryCard/CategoryCard.jsx';
import styles from './FeaturedCollections.module.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturedCollections() {
  const [categoriesList, setCategoriesList] = useState([]); // 3. State for DB data
  const [isLoading, setIsLoading] = useState(true);

  // 4. FETCH LIVE CATEGORIES FROM BACKEND
  useEffect(() => {
    const fetchLiveCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategoriesList(res.data);
      } catch (err) {
        console.error("Failed to load collections from database", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveCategories();
  }, []);

  // 5. Hide section if there are no categories yet
  if (!isLoading && categoriesList.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Explore by Style</span>
          <h2 className={styles.title}>Featured Collections</h2>
          <p className={styles.desc}>
            From timeless silks to modern designer weaves — discover sarees for every occasion and personality.
          </p>
        </div>

        {isLoading ? (
          <div className={styles.loader}>Loading Collections...</div>
        ) : (
          <motion.div
            className={styles.grid}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {categoriesList.map((cat) => (
              <motion.div key={cat._id} variants={itemVariants}>
                {/* 6. Ensure CategoryCard uses cat._id instead of cat.id */}
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}