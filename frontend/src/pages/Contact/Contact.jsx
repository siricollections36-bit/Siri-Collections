import { motion } from 'framer-motion';
import styles from './Contact.module.css';

export default function Contact() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={styles.heading}>Get in Touch</h1>
        <p className={styles.subheading}>We'd love to hear from you. Reach out to us through any of the following channels.</p>
      </motion.div>

      {/* Content - Form Section Removed */}
      <div className={styles.content}>
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ gridColumn: '1 / -1' }} // This ensures it centers if the CSS uses a grid
        >
          <h2 className={styles.infoTitle}>Contact Information</h2>

          {/* Contact Cards */}
          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>📍</div>
              <h3 className={styles.cardTitle}>Address</h3>
              <p className={styles.cardText}>
                D NO:11-51-8<br />
                RATHAM CENTRE<br />
                POTTISWAMY STREET<br />
                Canal Road, Vijayawada-520001<br />
                Andhra Pradesh
              </p>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>📞</div>
              <h3 className={styles.cardTitle}>Phone</h3>
              <p className={styles.cardText}>
                <a href="tel:+919876543210" className={styles.link}>
                  +91 9505248589
                </a>
                <br />
                <span className={styles.hours}>Mon-Fri 10 AM - 6 PM IST</span>
              </p>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>✉️</div>
              <h3 className={styles.cardTitle}>Email</h3>
              <p className={styles.cardText}>
                <a href="mailto:siricollections36@gmail.com" className={styles.link}>
                  siricollections36@gmail.com
                </a>
              </p>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.cardIcon}>🕐</div>
              <h3 className={styles.cardTitle}>Business Hours</h3>
              <p className={styles.cardText}>
                Monday - Friday: 10 AM - 6 PM<br />
                Saturday: 11 AM - 5 PM<br />
                Sunday: Closed<br />
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.socialLinks}>
            <h3 className={styles.socialTitle}>Follow Us</h3>
            <div className={styles.socialIcons}>
              
              <a href="https://www.instagram.com/sirisha.satish.583?igsh=MWYwZ2cyZnpvNTcweA%3D%3D" className={styles.socialIcon}>ig</a>
              
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}