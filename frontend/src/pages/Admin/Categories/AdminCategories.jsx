import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../../components/Modal/Modal';
import styles from './AdminCategories.module.css';

const API_URL = 'http://localhost:5000/api/categories';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({ name: '', image: null });
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (err) { console.error("Fetch failed"); }
    finally { setIsLoading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert("Please select an image");

    setIsSaving(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('image', formData.image);

    try {
      await axios.post(`${API_URL}/add`, data);
      await fetchCategories();
      handleClose();
    } catch (err) {
      alert("Error adding category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setFormData({ name: '', image: null });
    setPreview(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setCategories(prev => prev.filter(c => c._id !== id));
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Categories</h1>
          <p className={styles.subtitle}>View and manage your store collections</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + Add New Category
        </button>
      </header>

      {isLoading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <motion.div 
              key={cat._id} 
              className={styles.card}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.cardImage}>
                <img src={cat.image} alt={cat.name} />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardName}>{cat.name}</h3>
                <p className={styles.status}>Live on site</p>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDelete(cat._id)}>
                DELETE CATEGORY
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <>
            <div className={styles.modalOverlay} onClick={handleClose} />
            <motion.div className={styles.modal} initial={{ opacity: 0, y: '-60%', x: '-50%' }} animate={{ opacity: 1, y: '-50%', x: '-50%' }}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>New Category</h2>
                <button className={styles.closeBtn} onClick={handleClose}>×</button>
              </div>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Cover Image</label>
                  <div className={styles.uploadPreview} onClick={() => document.getElementById('fileIn').click()}>
                    {preview ? <img src={preview} alt="" /> : <span>Click to upload photo</span>}
                  </div>
                  <input id="fileIn" type="file" hidden accept="image/*" onChange={handleFileChange} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category Name</label>
                  <input type="text" className={styles.input} placeholder="e.g. Silk Sarees" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
                  <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                    {isSaving ? 'Uploading...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}