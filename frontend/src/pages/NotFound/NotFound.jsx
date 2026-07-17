import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Floating Decorative Element */}
        <motion.div
          className={styles.decoration}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🧵
        </motion.div>

        {/* 404 Number */}
        <motion.div
          className={styles.notFoundNumber}
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
        >
          404
        </motion.div>

        {/* Heading */}
        <motion.h1
          className={styles.heading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Page Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          className={styles.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Sorry, the page you're looking for doesn't exist or has been moved. Let's get you back to exploring our beautiful collection of sarees.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className={styles.buttonGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link to="/" className={styles.primaryBtn}>
            Go Home
          </Link>
          <Link to="/collections" className={styles.secondaryBtn}>
            Browse Collections
          </Link>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className={styles.decorativeSquare1}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className={styles.decorativeSquare2}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}
