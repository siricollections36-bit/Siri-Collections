import { useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the email used during checkout from navigation state
  const guestEmail = location.state?.email || "";

  // If someone tries to access this page without a valid order ID in the URL
  if (!orderId) {
    return <div className={styles.error}>Order not found.</div>;
  }

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.successIcon}>✓</div>
        <h1 className={styles.title}>Thank You for Your Purchase!</h1>
        <p className={styles.subtitle}>Your order has been placed successfully.</p>
        
        <div className={styles.orderInfo}>
          <span>Order Number:</span>
          <strong>#{orderId}</strong>
        </div>

        <p className={styles.confirmationMsg}> 
          Your items will be dispatched within 48 hours.
        </p>

        {/* GUEST SIGNUP PROMPT - Real-time scalability feature */}
        {!user && (
          <div className={styles.signupBox}>
            <h3>Track your order easily</h3>
            <p>Create an account using this email to view your order history and live tracking status.</p>
            <button 
              className={styles.signupBtn}
              onClick={() => navigate(`/signup?email=${encodeURIComponent(guestEmail)}`)}
            >
              CREATE ACCOUNT
            </button>
          </div>
        )}

        <div className={styles.actions}>
          <Link to="/shop" className={styles.shopBtn}>Continue Shopping</Link>
          <Link to="/" className={styles.homeLink}>Back to Home</Link>
        </div>
      </motion.div>
    </div>
  );
}