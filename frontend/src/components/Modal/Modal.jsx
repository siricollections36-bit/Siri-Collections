import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Modal.module.css';

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* NEW WRAPPER HERE */}
          <div className={styles.modalWrapper}>
            <motion.div
              className={`${styles.modal} ${styles[size]}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }} // Clean animation
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className={styles.header}>
                {title && <h3 className={styles.title}>{title}</h3>}
                <button className={styles.close} onClick={onClose}>✕</button>
              </div>

              <div className={styles.body}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}