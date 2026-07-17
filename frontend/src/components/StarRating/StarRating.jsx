import styles from './StarRating.module.css';

export default function StarRating({ rating, reviewCount, size = 'sm' }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <div className={styles.stars}>
        {Array(full).fill(0).map((_, i) => (
          <span key={`f${i}`} className={styles.star}>★</span>
        ))}
        {hasHalf && <span className={`${styles.star} ${styles.half}`}>★</span>}
        {Array(empty).fill(0).map((_, i) => (
          <span key={`e${i}`} className={`${styles.star} ${styles.empty}`}>★</span>
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className={styles.count}>({reviewCount})</span>
      )}
    </div>
  );
}
