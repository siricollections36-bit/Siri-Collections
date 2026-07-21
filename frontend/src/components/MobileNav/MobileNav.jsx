import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext'; // Using your existing context
import { useWishlist } from '../../context/WishlistContext'; 
import styles from './MobileNav.module.css';
import { 
  AiOutlineHome, 
  AiOutlineShop, 
  AiOutlineHeart, 
  AiOutlineUser, 
  AiOutlineShoppingCart 
} from 'react-icons/ai';

const MobileNav = () => {
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  return (
    <nav className={styles.mobileNav}>
      <NavLink to="/" className={({ isActive }) => isActive ? styles.active : styles.navItem}>
        <AiOutlineHome />
        <span>Home</span>
      </NavLink>

      <NavLink to="/shop" className={({ isActive }) => isActive ? styles.active : styles.navItem}>
        <AiOutlineShop />
        <span>Shop</span>
      </NavLink>

      <NavLink to="/wishlist" className={({ isActive }) => isActive ? styles.active : styles.navItem}>
        <div className={styles.iconWrapper}>
          <AiOutlineHeart />
          {wishlistItems?.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
        </div>
        <span>Wishlist</span>
      </NavLink>

      <NavLink to="/cart" className={({ isActive }) => isActive ? styles.active : styles.navItem}>
        <div className={styles.iconWrapper}>
          <AiOutlineShoppingCart />
          {cartItems?.length > 0 && <span className={styles.badge}>{cartItems.length}</span>}
        </div>
        <span>Cart</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;