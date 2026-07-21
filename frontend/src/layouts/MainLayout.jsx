import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar.jsx';
import Footer from '../components/Footer/Footer.jsx';
import styles from './MainLayout.module.css';
import MobileNav from '../components/MobileNav/MobileNav'; // Double check this path!


export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <MobileNav /> 
    </div>
  );
}
