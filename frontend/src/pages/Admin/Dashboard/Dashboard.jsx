import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../../../utils/formatters.js';
import Loader from '../../../components/Loader/Loader.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalCustomers: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real-time stats and orders from your MongoDB
        const [statsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats'),
          axios.get('http://localhost:5000/api/orders')
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5)); // Only show latest 5
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) return <Loader fullPage />;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>Welcome back, here is what's happening today.</p>
      </header>

      {/* STAT CARDS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.ordersIcon}`}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL ORDERS</span>
            <h2 className={styles.statNumber}>{stats.totalOrders}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.customersIcon}`}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL CUSTOMERS</span>
            <h2 className={styles.statNumber}>{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.productsIcon}`}>📍</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>TOTAL PRODUCTS</span>
            <h2 className={styles.statNumber}>{stats.totalProducts}</h2>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className={styles.recentSection}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.noData}>
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className={styles.idCell}>{order.orderNumber}</td>
                    <td>
                      <div className={styles.customerName}>{order.customer.name}</div>
                      <div className={styles.customerEmail}>{order.customer.email}</div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className={styles.amountCell}>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.orderStatus.toLowerCase()]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}