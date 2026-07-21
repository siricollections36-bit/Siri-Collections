import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import styles from './Checkout.module.css';

const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { items, cartSubtotal, shippingFee, cartTotal, clearCart } = useCart();
  const { user } = useAuth(); 
  const { show } = useToast();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- THE FIX: State to preserve summary data after cart is cleared ---
  const [confirmedDetails, setConfirmedDetails] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0
  });

  const [shippingData, setShippingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setShippingData(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingData((prev) => ({ ...prev, [name]: value }));
  };

 const handlePayNow = async () => {
    const { name, email, phone, address, city, state, pincode } = shippingData;
    
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      show('Please fill in all shipping details', 'error');
      return;
    }

    setIsProcessing(true);

    const isScriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!isScriptLoaded) {
      show('Payment system failed to load', 'error');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. REMOVED: const backendUrl = 'http://localhost:5000';
      
      const checkoutSnapshot = {
        items: [...items],
        subtotal: cartSubtotal,
        shipping: shippingFee,
        total: cartTotal
      };

      // 2. CHANGED: Using api.post and relative path '/orders/create'
      const { data: orderData } = await api.post('/orders/create', {
        amount: cartTotal, 
        shippingData,
        userId: user?._id || user?.id || null,
        items: items.map(item => ({
          product: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || item.image
        }))
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Siri Collections",
        description: `Order #${orderData.orderNumber}`,
        image: "",
        order_id: orderData.razorpayOrderId, 
        handler: async function (response) {
          try {
            // 3. CHANGED: Using api.post and relative path '/orders/verify'
            const verifyRes = await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              clearCart(); 
              setIsProcessing(false);
              navigate(`/order-success/${orderData.orderNumber}`, { 
                state: { email: shippingData.email } 
              });
            }
          } catch (err) {
            show("Payment verification failed", "error");
            setIsProcessing(false);
          }
        },
        prefill: {  name: shippingData.name,
    email: shippingData.email,
    contact: shippingData.phone },
        theme: { color: "#1a4a34" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
console.log("DEBUGGING RAZORPAY PAYLOAD:");
console.log("Key:", import.meta.env.VITE_RAZORPAY_KEY_ID);
console.log("Order ID:", orderData.razorpayOrderId);
console.log("Amount (in paise):", orderData.amount);

if (!orderData.razorpayOrderId) {
    alert("CRITICAL ERROR: Backend did not return a Razorpay Order ID!");
}
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      show(error.response?.data?.message || 'Transaction error.', 'error');
      setIsProcessing(false);
    }
  };

  // Determine which data to show (Live Cart or the Confirmed Snapshot)
  const displayItems = showSuccessModal ? confirmedDetails.items : items;
  const displaySubtotal = showSuccessModal ? confirmedDetails.subtotal : cartSubtotal;
  const displayShipping = showSuccessModal ? confirmedDetails.shipping : shippingFee;
  const displayTotal = showSuccessModal ? confirmedDetails.total : cartTotal;

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className={styles.emptyCheckout}>
        <div className={styles.emptyContent}>
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className={styles.continueShoppingBtn}>Back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.checkoutHeader}>
        <h1 className={styles.pageTitle}>Checkout</h1>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.formColumn}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>1. Shipping Address</h2>
            <div className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input type="text" name="name" value={shippingData.name} onChange={handleShippingChange} className={styles.input} disabled={showSuccessModal} required />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input type="email" name="email" value={shippingData.email} onChange={handleShippingChange} className={styles.input} disabled={showSuccessModal} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input type="tel" name="phone" value={shippingData.phone} onChange={handleShippingChange} className={styles.input} placeholder="10-digit mobile" disabled={showSuccessModal} required />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Street Address</label>
                  <input type="text" name="address" value={shippingData.address} onChange={handleShippingChange} className={styles.input} disabled={showSuccessModal} required />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>City</label>
                  <input type="text" name="city" value={shippingData.city} onChange={handleShippingChange} placeholder="City" className={styles.input} disabled={showSuccessModal} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>State</label>
                  <input type="text" name="state" value={shippingData.state} onChange={handleShippingChange} placeholder="State" className={styles.input} disabled={showSuccessModal} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Pincode</label>
                  <input type="text" name="pincode" value={shippingData.pincode} onChange={handleShippingChange} maxLength="6" placeholder="Pincode" className={styles.input} disabled={showSuccessModal} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryHeading}>Order Summary</h3>
            <div className={styles.itemList}>
              {displayItems.map((item) => (
                <div key={item._id || item.id} className={styles.summaryItem}>
                  <img src={item.images?.[0] || item.image} alt="" className={styles.itemThumb} />
                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                  </div>
                  <p className={styles.itemPrice}>{formatPrice((item.price) * (item.quantity))}</p>
                </div>
              ))}
            </div>

            <div className={styles.divider} />
            <div className={styles.calcRow}><span>Subtotal</span><span>{formatPrice(displaySubtotal)}</span></div>
            <div className={styles.calcRow}><span>Shipping</span><span>{formatPrice(displayShipping)}</span></div>
            <div className={styles.divider} />
            <div className={`${styles.calcRow} ${styles.grandTotal}`}>
              <span>Total to Pay</span>
              <span>{formatPrice(displayTotal)}</span>
            </div>

            <button className={styles.payBtn} onClick={handlePayNow} disabled={isProcessing || showSuccessModal}>
              {isProcessing ? 'PROCESSING...' : showSuccessModal ? 'PAID ✓' : 'PAY NOW'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div className={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.modalContent}>
              <div className={styles.successIcon}>✓</div>
              <h2>Payment Successful!</h2>
              <p>Order ID: <strong>#{orderNumber}</strong></p>
              {!user && (
                <div className={styles.guestPromo}>
                  <p>Create an account to track your orders easily.</p>
                  <button className={styles.promoBtn} onClick={() => navigate(`/signup?email=${encodeURIComponent(shippingData.email)}`)}>CREATE ACCOUNT</button>
                </div>
              )}
              <button className={styles.closeModalBtn} onClick={() => navigate('/')}>Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
