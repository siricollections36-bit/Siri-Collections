import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import styles from './Signup.module.css';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup } = useAuth();
  const { show } = useToast();

  // Initial state setup
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- THE FIX: Clear inputs on mount ---
  // We clear everything EXCEPT the email if it was provided in the URL from Checkout
  useEffect(() => {
    setFullName('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    
    // If there is no email in the URL, clear the email field too
    if (!searchParams.get('email')) {
      setEmail('');
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      show('Please fix the errors below', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(fullName, email, password);

      if (result.success) {
        show('Welcome! Your previous guest orders have been linked.', 'success');
        
        if (result.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        show(result.message || 'Signup failed', 'error');
      }
    } catch (err) {
      show('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Side: Brand Benefits */}
      <motion.div
        className={styles.decorativeLeft}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.imageOverlay} />
        <div className={styles.brandContent}>
          <div className={styles.logoBadge}>SC</div>
          <h2 className={styles.brandText}>Siri Collections</h2>
          <p className={styles.tagline}>Premium Designs for Timeless Elegance</p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Link previous guest orders instantly</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Secure cloud-synced profile</span>
            </div>
            <div className={styles.benefit}>
              <span className={styles.benefitIcon}>✓</span>
              <span>Priority customer support</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side: Signup Form */}
      <motion.div
        className={styles.formSection}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.formContainer}>
          <h1 className={styles.heading}>Create Account</h1>
          <p className={styles.subheading}>Register for a personalized experience</p>

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME</label>
              <input
                type="text"
                name="fullName"
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="new-name"
                required
              />
              {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-email"
                required
              />
              {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CREATE PASSWORD</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CONFIRM PASSWORD</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSING REGISTRATION...' : 'REGISTER NOW'}
            </button>
          </form>

          <p className={styles.loginPrompt}>
            Already have an account? <Link to="/login" className={styles.loginLink}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}