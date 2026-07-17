import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import Loader from '../../components/Loader/Loader';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info'); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/orders/user/${user.email}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [user]);

  if (!user) return <div className={styles.loginMessage}>Please log in to view your profile.</div>;

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        {/* Profile Header */}
        <div className={styles.profileCard}>
          <div className={styles.headerFlex}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>{user.name[0].toUpperCase()}</div>
              <div className={styles.userMainInfo}>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
                <span className={styles.badge}>{user.role}</span>
              </div>
            </div>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabWrapper}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Personal Info
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.contentCard}>
          {activeTab === 'info' ? (
            <div className={styles.infoSection}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
                <div className={styles.infoItem}>
                  <label>Account Created</label>
                  <p>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.orderSection}>
              {loading ? (
                <div className={styles.loadingWrap}><Loader /></div>
              ) : orders.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🛍️</div>
                  <h3>No orders yet</h3>
                  <p>Looks like you haven't discovered our beautiful sarees yet.</p>
                  <Link to="/shop" className={styles.shopBtn}>Start Shopping</Link>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.map((order) => (
                    <div key={order._id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <span className={styles.orderId}>Order #{order.orderNumber}</span>
                          <p className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className={styles.orderStatus}>
                           <span className={`${styles.statusDot} ${styles[order.orderStatus.toLowerCase()]}`}></span>
                           {order.orderStatus}
                        </div>
                      </div>
                      <div className={styles.orderItems}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.miniItem}>
                            <img src={item.image} alt="" />
                            <span>{item.name} (x{item.quantity})</span>
                          </div>
                        ))}
                      </div>
                      <div className={styles.orderFooter}>
                        <span>Total Paid: <strong>{formatPrice(order.totalAmount)}</strong></span>
                        <button className={styles.viewDetailsBtn}>Track Order</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}