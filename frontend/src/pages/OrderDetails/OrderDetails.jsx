import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api'; 
import { formatPrice } from '../../utils/formatters';
import Loader from '../../components/Loader/Loader';
import styles from './OrderDetails.module.css';

export default function OrderDetails() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Correct API call to your backend
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Order Details Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <Loader fullPage />;
  
  if (!order) return (
    <div className={styles.container} style={{textAlign:'center', padding: '100px'}}>
      <h2 style={{color: '#1a4a34'}}>Order Not Found</h2>
      <p>We couldn't retrieve the details for this order.</p>
      <Link to="/orders" style={{textDecoration: 'underline'}}>Back to My Orders</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/orders" className={styles.backBtn}>← My Orders</Link>
          <h1 className={styles.title}>Order Details</h1>
          <p className={styles.orderNum}>Order ID: <strong>#{order.orderNumber}</strong></p>
        </header>

        <div className={styles.grid}>
          <div className={styles.infoColumn}>
            <section className={styles.card}>
              <h3>Shipping Address</h3>
              <p><strong>{order.customer.name}</strong></p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p>Phone: {order.customer.phone}</p>
            </section>

            <section className={styles.card}>
              <h3>Order Tracking</h3>
              <p>Status: <span className={`${styles.status} ${styles[order.orderStatus.toLowerCase()]}`}>{order.orderStatus}</span></p>
              <p>Payment: <strong>{order.paymentStatus}</strong></p>
            </section>
          </div>

          <div className={styles.summaryColumn}>
            <section className={styles.card}>
              <h3>Items in this Order</h3>
              <div className={styles.itemList}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <img src={item.image} alt="" className={styles.itemImg} />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemQty}>Qty: {item.quantity}</p>
                    </div>
                    <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.totalRow}>
                <span>Total Amount Paid:</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}