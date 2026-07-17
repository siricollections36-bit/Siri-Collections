import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Footer.module.css';

// FIX: Use the exact path to your logo from the assets folder
import footerLogo from '../../assets/logos/{B39839BA-3DDD-44D0-A6FC-AEACFFCE1712}.png';

export default function Footer() {
  const [settings, setSettings] = useState({
    storeName: 'Siri Textiles',
    storeEmail: '',
    phone: '',
    address: '',
    instagram: '',
    youtube: ''
  });

  // Fetch live settings from MongoDB Atlas via your Backend
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/settings');
        if (res.data) {
          // Sync state with the real keys from your database
          setSettings(res.data);
        }
      } catch (err) {
        console.log("Using default footer settings");
      }
    };
    fetchFooterData();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
               <img src={footerLogo} alt="Siri Collections" className={styles.logo} />
               <h2 className={styles.brandName}>{settings.storeName || 'Siri Collections'}</h2>
            </div>
            
            <p className={styles.brandDesc}>
              Bringing you the finest collection of sarees with elegance, tradition and craftsmanship for years.
            </p>
            
            <div className={styles.contactDetails}>
              {settings.address && <p className={styles.contactItem}><span>📍</span> {settings.address}</p>}
              {settings.phone && <p className={styles.contactItem}><span>📞</span> {settings.phone}</p>}
              {settings.storeEmail && <p className={styles.contactItem}><span>✉️</span> {settings.storeEmail}</p>}
            </div>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/collections">Collections</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Customer Care</h4>
            <ul className={styles.linkList}>
              <li><Link to="/wishlist">My Wishlist</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/orders">Order Tracking</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {settings.storeName}. Crafted for Elegance.
          </p>
          <div className={styles.payments}>
            <span className={styles.payLabel}>Safe Checkout:</span>
            <div className={styles.payIcons}>
              <span className={styles.chip}>Razorpay</span>
              <span className={styles.chip}>UPI</span>
              <span className={styles.chip}>Cards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}