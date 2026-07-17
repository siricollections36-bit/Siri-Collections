import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './CategoryCard.module.css';

export default function CategoryCard({ category }) {
  // Defensive check: If for some reason category is undefined, don't crash
  if (!category) return null;

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* 
        We use encodeURIComponent because category names like "Silk Sarees" 
        have spaces. This ensures the URL looks like /shop?category=Silk%20Sarees 
      */}
      <Link to={`/shop?category=${encodeURIComponent(category.name)}`}>
        <div className={styles.imageWrap}>
          {/* Use the Cloudinary URL from the database */}
          <img 
            src={category.image || '/placeholder-category.jpg'} 
            alt={category.name} 
            className={styles.image} 
            loading="lazy" 
          />
          
          <div className={styles.overlay} />
          
          <div className={styles.content}>
            <h3 className={styles.name}>{category.name}</h3>
            
            {/* Added optional chaining for description */}
            {category.description && (
              <p className={styles.description}>{category.description}</p>
            )}
            
            <span className={styles.cta}>Explore Collection →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}