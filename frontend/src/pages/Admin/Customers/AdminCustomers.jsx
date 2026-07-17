import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../../../components/Loader/Loader.jsx';
import styles from './AdminCustomers.module.css';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/customers');
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // REAL-TIME SEARCH LOGIC
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader fullPage />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Customer Management</h1>

      {/* TOTAL CUSTOMER COUNT CARD */}
      <div className={styles.statsCard}>
        <h2 className={styles.countNumber}>{customers.length}</h2>
        <p className={styles.countLabel}>TOTAL REGISTERED CUSTOMERS</p>
      </div>

      {/* SEARCH BAR */}
      <div className={styles.searchSection}>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* CUSTOMER TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL ADDRESS</th>
              <th>JOINED ON</th>
              <th>TOTAL ORDERS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr><td colSpan="4" className={styles.noData}>No customers found matching your search.</td></tr>
            ) : (
              filteredCustomers.map((user) => (
                <tr key={user._id}>
                  <td className={styles.nameCell}><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{new Date(user.joinedDate).toLocaleDateString('en-IN')}</td>
                  <td className={styles.orderCountCell}>
                    <span className={user.totalOrders > 0 ? styles.activeBuyer : styles.zeroBuyer}>
                      {user.totalOrders}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}