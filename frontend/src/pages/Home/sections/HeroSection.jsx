import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { heroBanners } from '../../../data/banners.js';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + heroBanners.length) % heroBanners.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((c) => (c + 1) % heroBanners.length);
  };

  const banner = heroBanners[current];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <section className={styles.hero}>
      {/* Background Image */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          className={styles.bgWrap}
          custom={direction}
          variants={{ enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7 }}
        >
          <img src={banner.image} alt={banner.heading} className={styles.bgImage} />
          <div className={styles.overlay} />
        </motion.div>
      </AnimatePresence>

      {/* Decorative shapes */}
      <div className={styles.shape1} />
      <div className={styles.shape2} />

      {/* Content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            className={styles.textBlock}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h1
              className={styles.heading}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {banner.heading}
            </motion.h1>
            <motion.span
              className={styles.subheading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              — {banner.subheading}
            </motion.span>
            <motion.p
              className={styles.description}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {banner.description}
            </motion.p>
            <motion.div
              className={styles.ctas}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to={banner.ctaLink} className={styles.btnPrimary}>
                {banner.cta}
              </Link>
              <Link to={banner.secondaryCtaLink} className={styles.btnOutline}>
                {banner.secondaryCta}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
        ‹
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
        ›
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {heroBanners.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel} />
        </div>
        <span className={styles.scrollText}>Scroll</span>
      </div>

      {/* Curved Divider */}
      <div className={styles.curvedBottom}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="var(--color-bg-ivory)" />
        </svg>
      </div>
    </section>
  );
}
