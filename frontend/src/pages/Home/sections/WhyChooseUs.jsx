import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './WhyChooseUs.module.css';

const features = [
  { 
    id: 1, 
    title: 'Premium Quality', 
    desc: 'Finest quality assured — every saree passes a 20-point quality check before dispatch.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> 
  },
  { 
    id: 2, 
    title: 'Affordable Luxury', 
    desc: 'Designer sarees at prices that don\'t compromise quality or your budget.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> 
  },
  { 
    id: 3, 
    title: 'Trusted Since Years', 
    desc: 'Happy customers across India. Your trust is our greatest reward.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 
  },
  { 
    id: 4, 
    title: 'Fast Shipping', 
    desc: 'Express delivery available. On-time, every time — across 500+ cities in India.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> 
  },
  { 
    id: 5, 
    title: 'Secure Payments', 
    desc: '100% secure transactions. UPI, Cards, NetBanking, COD — pay your way, safely.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 
  },
  { 
    id: 6, 
    title: 'Easy Returns', 
    desc: 'Ensure you take a video from opening the package. Returns and exchanges subject to policy.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> 
  },
];

export default function WhyChooseUs() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setActiveIdx((prev) => (prev + newDirection + features.length) % features.length);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Our Promise</span>
          <h2 className={styles.title}>Why Choose Siri Collections</h2>
        </div>

        <div className={styles.mobileWrapper}>
          <button className={styles.navBtn} onClick={() => paginate(-1)}>‹</button>
          
          <div className={styles.sliderContent}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className={styles.mobileCard}
              >
                <div className={styles.iconWrap}>{features[activeIdx].icon}</div>
                <h3 className={styles.cardTitle}>{features[activeIdx].title}</h3>
                <p className={styles.cardDesc}>{features[activeIdx].desc}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className={styles.navBtn} onClick={() => paginate(1)}>›</button>
        </div>

        <div className={styles.dots}>
          {features.map((_, i) => (
            <div key={i} className={`${styles.dot} ${activeIdx === i ? styles.dotActive : ''}`} onClick={() => setActiveIdx(i)} />
          ))}
        </div>

        <div className={styles.desktopGrid}>
          {features.map((f) => (
            <div key={f.id} className={styles.card}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}