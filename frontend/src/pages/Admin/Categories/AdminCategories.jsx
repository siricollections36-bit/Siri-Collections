import { useState, useEffect } from 'react';
import api from '../../../utils/api'; 
import { motion } from 'framer-motion';
import Modal from '../../../components/Modal/Modal'; 
import styles from './AdminCategories.module.css';

const ITEMS_PER_PAGE = 6;

/**
 * CUSTOM DELETE CONFIRMATION COMPONENT
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, categoryName }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete" size="sm">
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <p style={{ marginBottom: '25px', color: '#444', fontSize: '1rem', lineHeight: '1.5' }}>
        Are you sure you want to delete the <strong>{categoryName}</strong> collection?<br/>
        <small style={{ color: '#888' }}>This will affect products assigned to this category.</small>
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className={styles.cancelBtn} onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        <button 
          className={styles.deleteBtn} 
          style={{ flex: 2, background: '#c0392b', color: 'white', border: 'none' }}
          onClick={onConfirm}
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </Modal>
);

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [formData, setFormData] = useState({ name: '', image: null });
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) { console.error("Fetch failed"); }
    finally { setIsLoading(false); }
  };

  // Pagination Logic
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const displayedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
     await api.post('/categories/add', data)
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

  // Opens the styled delete modal instead of browser confirm
  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/categories/${categoryToDelete._id}`);
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setIsDeleteOpen(false);
      // Reset page if needed
      if (displayedCategories.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Categories</h1>
          <p className={styles.subtitle}>Manage your store collections</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + Add New Category
        </button>
      </header>

      {isLoading ? (
        <div className={styles.loader}>Loading...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {displayedCategories.map((cat) => (
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
                  <p className={styles.statusBadge}>Active Collection</p>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.deleteBtn} onClick={() => openDeleteModal(cat)}>
                    DELETE
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={styles.pageBtn}>←</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={styles.pageBtn}>→</button>
            </div>
          )}
        </>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isModalOpen} onClose={handleClose} title="New Category">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image</label>
            <div className={styles.uploadPreview} onClick={() => document.getElementById('fileIn').click()}>
              {preview ? <img src={preview} alt="preview" className={styles.previewImg} /> : <div className={styles.uploadPlaceholder}><span>+</span><p>Upload Photo</p></div>}
            </div>
            <input id="fileIn" type="file" hidden accept="image/*" onChange={handleFileChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Name</label>
            <input type="text" className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>{isSaving ? 'Uploading...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* NEW: CUSTOM DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
        categoryName={categoryToDelete?.name}
      />
    </div>
  );
}