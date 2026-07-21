import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from "../../../utils/api";
import { formatPrice, formatDate } from '../../../utils/formatters.js';
import styles from './Dashboard.module.css';

const StatCard = ({ icon, label, value }) => (
  <motion.div className={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className={styles.statHeader}><span className={styles.statIcon}>{icon}</span></div>
    <p className={styles.statLabel}>{label}</p>
    <p className={styles.statValue}>{value}</p>
  </motion.div>
);

export default function Dashboard() {
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ orders: 0, products: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders?dashboard=true'),
          api.get('/products')
        ]);

        if (ordersRes.data && ordersRes.data.orders) {
          setRecentOrders(ordersRes.data.orders);
          setStats(prev => ({ ...prev, orders: ordersRes.data.totalOrders || 0 }));
        }

        if (productsRes.data) {
          const pCount = productsRes.data.totalProducts || (Array.isArray(productsRes.data) ? productsRes.data.length : 0);
          setStats(prev => ({ ...prev, products: pCount }));
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard icon="📦" label="Total Orders" value={stats.orders} />
        <StatCard icon="📍" label="Total Products" value={stats.products} />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>Loading...</td></tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    {/* ADDED data-label here for the Mobile CSS to pick up */}
                    <td data-label="Order ID" className={styles.orderId}>{order.orderNumber}</td>
                    <td data-label="Customer">
                      <div className={styles.custCol}>
                        <span className={styles.custName}>{order.customer?.name || 'Guest'}</span>
                        <small className={styles.custEmail}>{order.customer?.email}</small>
                      </div>
                    </td>
                    <td data-label="Date">{formatDate(order.createdAt)}</td>
                    <td data-label="Amount" className={styles.amount}>{formatPrice(order.totalAmount)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No recent orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}