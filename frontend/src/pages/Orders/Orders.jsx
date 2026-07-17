import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import Loader from '../../components/Loader/Loader';
import styles from './Orders.module.css';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        // Fetch real data from our backend
        const res = await axios.get(`http://localhost:5000/api/orders/my-orders/${user.email}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className={styles.loginPrompt}>
        <h2>Please Login</h2>
        <p>Log in to view your order history and track shipments.</p>
        <Link to="/login" className={styles.loginBtn}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <p className={styles.subtitle}>View and manage all your purchases in one place</p>
      </header>

      <div className={styles.content}>
        {loading ? (
          <Loader />
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet. Explore our latest collection!</p>
            <Link to="/shop" className={styles.shopBtn}>Explore Shop</Link>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className={styles.orderId}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>{order.items.length} Saree(s)</td>
                    <td className={styles.amount}>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.orderStatus.toLowerCase()]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <Link to={`/order-details/${order._id}`} className={styles.viewBtn}>
                        VIEW DETAILS
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}