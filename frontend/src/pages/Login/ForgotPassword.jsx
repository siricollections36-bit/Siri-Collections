import { useState } from 'react';
import api from '../../utils/api'; 
import { useToast } from '../../context/ToastContext';
import styles from './Login.module.css'; // Reuse login styles

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      show(data.message, 'success');
    } catch (err) {
      show(err.response?.data?.message || 'Error sending email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection} style={{ flex: 1 }}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Forgot Password</h2>
          <p className={styles.subtitle}>Enter your email to receive a secure reset link.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                className={styles.input} 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}