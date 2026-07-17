import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();

  // --- THE FIX: Clear inputs whenever this component is loaded ---
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      show('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call the login function in AuthContext
      const result = await login(email, password);

      if (result.success) {
        show('Welcome back to Siri Collections!', 'success');
        
        // 2. Redirect based on the role stored in MongoDB
        if (result.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Show specific error from backend (e.g. "Invalid email or password")
        show(result.message, 'error');
      }
    } catch (err) {
      show('An unexpected error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Side: Branding */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <div className={styles.logoBadge}>SC</div>
            <h1 className={styles.heroTitle}>Siri Collection</h1>
            <p className={styles.heroSubtitle}>Premium Designs for Timeless Elegance</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <header className={styles.header}>
            <h2 className={styles.title}>Welcome Back</h2>
            <p className={styles.subtitle}>Sign in to your account</p>
          </header>

          {/* Added autoComplete="off" to the form as a global hint to browsers */}
          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="youremail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                /* Forces browser to ignore cached info */
                autoComplete="new-email" 
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PASSWORD</label>
              <input
                type="password"
                name="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                /* Forces browser to ignore cached passwords */
                autoComplete="new-password" 
                required
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" name="remember" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotPass}>Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              className={styles.loginBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          <p className={styles.footerText}>
            Don't have an account? <Link to="/signup" className={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}