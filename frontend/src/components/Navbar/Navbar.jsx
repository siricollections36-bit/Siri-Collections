import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; // 1. Added Axios
import { useScrollPosition } from '../../hooks/useScrollPosition.js';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Navbar.module.css';

const LOGO_URL = '/src/assets/logos/{B39839BA-3DDD-44D0-A6FC-AEACFFCE1712}.png';

export default function Navbar() {
  const { isScrolled } = useScrollPosition();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // 2. State for Dynamic Categories from MongoDB
  const [liveCategories, setLiveCategories] = useState([]);
  
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // 3. FETCH CATEGORIES FROM BACKEND
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setLiveCategories(res.data);
      } catch (err) {
        console.error("Navbar: Failed to fetch categories from database");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Promo Bar */}
      <div className={styles.promoBar}>
        <div className={styles.promoTrack}>
          <span>Authentic Handcrafted Sarees & Jwellery</span>
          <span className={styles.promoDot}>•</span>
          <span style={{ fontWeight: '700' }}>COD Not Available</span>
          <span className={styles.promoDot}>•</span>
          <span>No Return and Exchange Except for Damages</span>
          <span className={styles.promoDot}>•</span>
          <span>Authentic Handcrafted Sarees & Jwellery</span>
          <span className={styles.promoDot}>•</span>
          <span style={{ fontWeight: '700' }}>COD Not Available</span>
        </div>
      </div>

      <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src={LOGO_URL} alt="Siri Collections" className={styles.logoImg} />
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              Shop
            </NavLink>
            
            {/* COLLECTIONS MEGA MENU (DYNAMIC) */}
            <div
              className={styles.megaMenuTrigger}
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button className={`${styles.navLink} ${styles.navBtn}`}>
                Collections <span className={styles.chevron}>▾</span>
              </button>
              <AnimatePresence>
                {collectionsOpen && liveCategories.length > 0 && (
                  <motion.div
                    className={styles.megaMenu}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.megaMenuGrid}>
                      {liveCategories.map((cat) => (
                        <Link
                          key={cat._id} // Using MongoDB _id
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className={styles.megaItem}
                          onClick={() => setCollectionsOpen(false)}
                        >
                          <div className={styles.megaItemImg}>
                            <img src={cat.image} alt={cat.name} />
                          </div>
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              Contact
            </NavLink>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>

            <div className={styles.profileWrap} onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
              <button className={styles.iconBtn} aria-label="Profile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className={styles.profileMenu}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {user ? (
                      <>
                        <div className={styles.profileUser}>
                          <span className={styles.profileName}>{user.name}</span>
                          <span className={styles.profileEmail}>{user.email}</span>
                        </div>
                        {user.role === 'admin' && (
                          <Link to="/admin" className={styles.profileMenuItem} onClick={() => setProfileOpen(false)}>
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" className={styles.profileMenuItem} onClick={() => setProfileOpen(false)}>
                          My Profile
                        </Link>
                        <Link to="/orders" className={styles.profileMenuItem} onClick={() => setProfileOpen(false)}>
                          My Orders
                        </Link>
                        <button className={`${styles.profileMenuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className={styles.profileMenuItem} onClick={() => setProfileOpen(false)}>
                          Login
                        </Link>
                        <Link to="/signup" className={styles.profileMenuItem} onClick={() => setProfileOpen(false)}>
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className={styles.hamburger} onClick={() => setMenuOpen(true)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchBar}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form className={styles.searchForm} onSubmit={handleSearch}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sarees by name or code..."
                  className={styles.searchInput}
                />
                <button type="button" onClick={() => setSearchOpen(false)} className={styles.searchClose}>✕</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu (Dynamic) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className={styles.mobileBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className={styles.mobileHeader}>
                <img src={LOGO_URL} alt="Siri Textiles" className={styles.mobileLogo} />
                <button onClick={() => setMenuOpen(false)} className={styles.mobileClose}>✕</button>
              </div>
              <nav className={styles.mobileNav}>
                <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/shop" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Shop</Link>
                
                {/* Dynamic Mobile Categories */}
                {liveCategories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className={`${styles.mobileLink} ${styles.mobileSub}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    — {cat.name}
                  </Link>
                ))}

                <Link to="/about" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
                <Link to="/contact" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Contact</Link>
                {user ? (
                  <>
                    <Link to="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Profile</Link>
                    {user.role === 'admin' && <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
                    <button className={`${styles.mobileLink} ${styles.mobileLogout}`} onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/signup" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Create Account</Link>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}