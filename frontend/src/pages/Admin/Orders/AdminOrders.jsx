import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPrice } from '../../../utils/formatters.js';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminOrders.module.css';

const API_URL = 'http://localhost:5000/api/orders';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'existing'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch live orders from MongoDB
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch orders failed:", err);
      setIsLoading(false);
    }
  };

  /**
   * 2. UPDATE STATUS: Marks as 'Dispatched'
   */
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  /**
   * 3. DELETE ORDER
   */
  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      try {
        await axios.delete(`${API_URL}/${orderId}`);
        setOrders(prev => prev.filter(o => o._id !== orderId));
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  // 4. PRINT FUNCTION
  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'new') return order.orderStatus === 'Processing';
    return order.orderStatus !== 'Processing';
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Order Management</h1>
        <p className={styles.subtitle}>Track and fulfill customer orders</p>
      </header>

      {/* TABS */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'new' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('new')}
        >
          New Orders ({orders.filter(o => o.orderStatus === 'Processing').length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'existing' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('existing')}
        >
          Existing Orders ({orders.filter(o => o.orderStatus !== 'Processing').length})
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loader}>Connecting to MongoDB...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="5" className={styles.noData}>No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>
                      <div className={styles.customerInfo}>
                        <span className={styles.custName}>{order.customer.name}</span>
                        <small className={styles.custEmail}>{order.customer.email}</small>
                      </div>
                    </td>
                    <td><span className={styles.amount}>{formatPrice(order.totalAmount)}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.orderStatus.toLowerCase()]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.viewBtn} onClick={() => setSelectedOrder(order)}>View Details</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(order._id)}>Delete</button>
                        {order.orderStatus === 'Processing' && (
                          <button 
                            className={styles.doneBtn} 
                            onClick={() => handleStatusUpdate(order._id, 'Dispatched')}
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PRINTABLE ORDER MODAL */}
      {selectedOrder && (
        <Modal 
          isOpen={!!selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          title={`Order: ${selectedOrder.orderNumber}`}
          size="lg"
        >
          <div className={styles.modalContent}>
             
             {/* EVERYTHING INSIDE THIS DIV WILL BE PRINTED */}
             <div id="printable-invoice" className={styles.printableArea}>
                <div className={styles.invoiceHeader}>
                  <div>
                    <h2 className={styles.brandName}>SIRI COLLECTIONS</h2>
                    <p className={styles.brandTagline}>Elegant Collection, Timeless Beauty</p>
                  </div>
                  <div className={styles.orderDateMeta}>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Order ID:</strong> {selectedOrder.orderNumber}</p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Shipping Address</span>
                    <p className={styles.addressValue}>
                      <strong>{selectedOrder.customer.name}</strong><br />
                      {selectedOrder.shippingAddress.address}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                      PIN: {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Order Summary</span>
                    <p className={styles.addressValue}>Payment: <strong>{selectedOrder.paymentStatus}</strong></p>
                    <p className={styles.addressValue}>Status: {selectedOrder.orderStatus}</p>
                    <p className={styles.addressValue}>Ph: {selectedOrder.customer.phone}</p>
                  </div>
                </div>

                <table className={styles.itemTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td><img src={item.image} className={styles.itemThumb} alt="" /></td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className={styles.invoiceFooter}>
                  <div className={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                    <span>Grand Total:</span>
                    <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
                  </div>
                </div>
             </div>

             {/* THESE BUTTONS ARE HIDDEN DURING PRINTING */}
             <div className={styles.modalActions}>
                <button className={styles.printBtn} onClick={handlePrint}>Print Invoice</button>
                <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>Close</button>
             </div>
          </div>
        </Modal>
      )}
    </div>
  );
}