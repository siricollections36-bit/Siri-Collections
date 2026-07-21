import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api'; 
import { useToast } from '../../context/ToastContext';
import styles from './Login.module.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { show } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return show("Passwords don't match", "error");

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      show("Password updated! Please login.", "success");
      navigate('/login');
    } catch (err) {
      show(err.response?.data?.message || "Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection} style={{ flex: 1 }}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Set New Password</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>NEW PASSWORD</label>
              <input type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <input type="password" className={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'UPDATING...' : 'RESET PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}