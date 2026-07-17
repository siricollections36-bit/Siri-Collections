import React from 'react';
import { motion } from 'framer-motion';
import styles from './InstagramGallery.module.css';

const InstagramGallery = () => {
  const featuredImage = 'https://cdn.phototourl.com/free/2026-07-16-ece16caf-0628-4607-82d2-891834ad5389.png';
  const instagramUrl = 'https://www.instagram.com/sirisha.satish.583/';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Follow Our Journey</h2>
        </div>

        <div className={styles.buttonWrapper}>
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.followButton}
          >
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramGallery;