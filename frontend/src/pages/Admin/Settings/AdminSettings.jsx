import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api'; 
import { useToast } from '../../../context/ToastContext.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import styles from './AdminSettings.module.css';


export default function AdminSettings() {
  const { show } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '',
    storeEmail: '',
    phone: '',
    address: '',
    instagram: '',
    youtube: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data) setFormData(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/admin/settings', formData);
      setFormData(res.data);
      setIsEditing(false);
      show('Settings updated successfully!', 'success');
    } catch (err) {
      // DEBUG: This will show you exactly why it failed in the F12 console
      console.error("Save Error:", err.response?.data); 
      show('Save failed: ' + (err.response?.data?.message || 'Server Error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className={styles.header}>
        <h1 className={styles.title}>Store Settings</h1>
        {!isEditing && (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Edit Settings
          </button>
        )}
      </div>

      <div className={styles.settingsCard}>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Store Name (Optional)</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={!isEditing ? styles.disabledInput : ''}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Store Email (Optional)</label>
              <input
                type="text"
                name="storeEmail"
                value={formData.storeEmail}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number (Optional)</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Business Address (Optional)</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Instagram URL (Optional)</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'SAVE'}
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}