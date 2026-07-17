import { motion } from 'framer-motion';
import styles from './About.module.css';



const VALUES = [
  {
    icon: '✨',
    title: 'Premium Quality',
    description: 'Handpicked sarees from the finest artisans across India',
  },
  {
    icon: '🎨',
    title: 'Authentic Design',
    description: 'Preserving traditional weaving techniques and heritage',
  },
  {
    icon: '💚',
    title: 'Ethical Sourcing',
    description: 'Direct partnerships with weavers for fair practices',
  },
  {
    icon: '🎁',
    title: 'Customer Care',
    description: 'Personalized service and lifetime support',
  },
];

export default function About() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Team"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay} />
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className={styles.heroTitle}>About Siri Collections</h1>
          <p className={styles.heroSubtitle}>Preserving Heritage, Celebrating Elegance</p>
        </motion.div>
      </motion.section>

      {/* Story Section */}
      <motion.section
        className={styles.storySection}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.storyContainer}>
          <div className={styles.storyContent}>
            <h2 className={styles.storyTitle}>Our Story</h2>
            <div className={styles.divider} />

            <p className={styles.storyText}>
              Founded with a passion for traditional Indian textiles, Siri Collections began as a small initiative to preserve the art of saree weaving. Over the past two decades, we have evolved into a premier destination for premium sarees, connecting master weavers with discerning customers across India and beyond.
            </p>

            <p className={styles.storyText}>
              Each saree in our collection tells a story of craftsmanship, heritage, and artistic excellence. From the silk corridors of Varanasi to the cotton looms of Tamil Nadu, we source directly from artisans, ensuring that every piece celebrates the true essence of Indian textile heritage.
            </p>

            <p className={styles.storyText}>
              At Siri Collections, we believe that a saree is not just a garment—it's an expression of elegance, identity, and cultural pride. Our mission is to make premium sarees accessible while maintaining the highest standards of quality and authenticity.
            </p>
          </div>
        </div>
      </motion.section>

     

      {/* Values Section */}
      <motion.section
        className={styles.valuesSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className={styles.valuesContainer}>
          <h2 className={styles.valuesTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map((value, idx) => (
              <motion.div
                key={idx}
                className={styles.valueCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 16px 48px rgba(5,71,42,0.15)' }}
              >
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDescription}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Commitment Section */}
      <motion.section
        className={styles.commitmentSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className={styles.commitmentContainer}>
          <h2 className={styles.commitmentTitle}>Our Commitment</h2>
          <div className={styles.commitmentContent}>
            <div className={styles.commitmentItem}>
              <h3>Artisan Partnerships</h3>
              <p>We work directly with weavers to ensure fair pricing and sustainable livelihoods for artisan communities.</p>
            </div>
            <div className={styles.commitmentItem}>
              <h3>Quality Assurance</h3>
              <p>Every saree undergoes rigorous quality checks to ensure it meets our exacting standards of excellence.</p>
            </div>
            <div className={styles.commitmentItem}>
              <h3>Sustainability</h3>
              <p>We are committed to eco-friendly practices in sourcing, production, and packaging.</p>
            </div>
            <div className={styles.commitmentItem}>
              <h3>Customer Excellence</h3>
              <p>Your satisfaction is our priority, with dedicated support for every purchase and styling guidance.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className={styles.ctaSection}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className={styles.ctaContent}>
          <h2>Discover Your Perfect Saree</h2>
          <p>Explore our curated collections of premium sarees</p>
          <a href="/collections" className={styles.ctaBtn}>
            Explore Collections
          </a>
        </div>
      </motion.section>
    </div>
  );
}
