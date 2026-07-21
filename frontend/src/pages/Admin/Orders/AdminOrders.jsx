import { useState, useEffect, useCallback } from 'react';
import api from '../../../utils/api'; 
import { formatPrice } from '../../../utils/formatters.js';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminOrders.module.css';


/**
 * DELETE MODAL
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, orderNumber, isDeleting }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Order" size="sm">
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <p style={{ marginBottom: '25px', color: '#444', fontSize: '1rem' }}>
        Are you sure you want to permanently delete order <strong>#{orderNumber}</strong>? <br/>
        This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className={styles.cancelBtn} onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        <button 
          className={styles.deleteBtn} 
          onClick={onConfirm} 
          disabled={isDeleting}
          style={{ flex: 2, background: '#c0392b', color: 'white' }}
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </Modal>
);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ new: 0, existing: 0 });

  // DELETE STATES
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
const res = await api.get('/orders', {
        params: {
          page: currentPage,
          limit: 8,
          tab: activeTab
        }
      });      
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
        setCounts({ 
          new: res.data.newCount || 0, 
          existing: res.data.existingCount || 0 
        });
      }
    } catch (err) {
      console.error("Fetch orders failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); 
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await api.delete(`/orders/${orderToDelete._id}`);
      
      if (response.data.success) {
        setIsDeleteOpen(false);
        setOrderToDelete(null);
        // THE FIX: Wait for state to close before re-fetching
        fetchOrders();
      }
    } catch (err) {
      console.error("Delete request error:", err);
      alert("Delete operation failed on server.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Order Management</h1>
        <p className={styles.subtitle}>Fulfill and track customer saree orders</p>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'new' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('new')}
        >
          New ({counts.new})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'existing' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('existing')}
        >
          Existing ({counts.existing})
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.loader}>Connecting to Database...</div>
        ) : (
          <>
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
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td data-label="ORDER ID" className={styles.idCell}>{order.orderNumber}</td>
                      <td data-label="CUSTOMER">
                        <div className={styles.customerInfo}>
                          <span className={styles.custName}>{order.customer?.name}</span>
                          <small className={styles.custEmail}>{order.customer?.email}</small>
                        </div>
                      </td>
                      <td data-label="AMOUNT"><span className={styles.amount}>{formatPrice(order.totalAmount)}</span></td>
                      <td data-label="STATUS">
                        <span className={`${styles.statusBadge} ${styles[order.orderStatus?.toLowerCase()]}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td data-label="ACTION">
                        <div className={styles.actionBtns}>
                          <button className={styles.viewBtn} onClick={() => setSelectedOrder(order)}>View</button>
                          <button className={styles.deleteBtn} onClick={() => openDeleteModal(order)}>Delete</button>
                          {order.orderStatus?.toLowerCase() === 'processing' && (
                            <button className={styles.doneBtn} onClick={() => handleStatusUpdate(order._id, 'Dispatched')}>
                              Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                       No {activeTab} orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  ← Previous
                </button>
                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FULL INVOICE MODAL */}
      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Invoice" size="lg">
          <div className={styles.modalContent}>
            <div id="printable-invoice" className={styles.invoicePage}>
                <div className={styles.invHeader}>
                  <div className={styles.brandInfo}>
                      <h1 className={styles.invBrandName}>SIRI COLLECTIONS</h1>
                      <p>Premium Saree Boutique</p>
                      <small>Vijayawada, AP | info@siricollections.com</small>
                  </div>
                  <div className={styles.invTitleBlock}>
                      <h2 className={styles.invTitle}>INVOICE</h2>
                      <p><strong>No:</strong> {selectedOrder.orderNumber}</p>
                  </div>
                </div>
                <hr className={styles.invDivider} />
                <div className={styles.invDetailsGrid}>
                  <div>
                      <span className={styles.invLabel}>BILLED TO:</span>
                      <p><strong>{selectedOrder.customer?.name}</strong></p>
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  </div>
                  <div className={styles.desktopRight}>
                      <span className={styles.invLabel}>ORDER DETAILS:</span>
                      <p>Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
                      <p>Status: {selectedOrder.orderStatus}</p>
                      <p>Payment: Online (Paid)</p>
                  </div>
                </div>
                <table className={styles.invTable}>
                  <thead>
                      <tr><th>Item</th><th>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr>
                  </thead>
                  <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <img src={item.image} className={styles.invThumb} alt="" />
                              <span>{item.name}</span>
                            </td>
                            <td>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className={styles.invSummary}>
                  <div className={styles.invSumRow}><span>Subtotal</span><span>{formatPrice(selectedOrder.totalAmount)}</span></div>
                  <div className={`${styles.invSumRow} ${styles.invGrandTotal}`}><span>Total Amount</span><span>{formatPrice(selectedOrder.totalAmount)}</span></div>
                </div>
            </div>
            <div className={styles.modalActions}>
                <button className={styles.printBtn} onClick={() => window.print()}>Print Invoice</button>
                <button className={styles.closeBtn} onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        orderNumber={orderToDelete?.orderNumber} 
        isDeleting={isDeleting}
      />
    </div>
  );
}