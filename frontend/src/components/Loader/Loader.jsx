import styles from './Loader.module.css';

export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.spinner} />
        <p className={styles.text}>Loading...</p>
      </div>
    );
  }
  return <div className={styles.spinner} />;
}
