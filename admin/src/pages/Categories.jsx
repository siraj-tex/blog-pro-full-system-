import { useState, useEffect } from 'react';
import API from '../config/api';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlinePencilSquare, HiOutlinePlusCircle } from 'react-icons/hi2';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/categories/${editId}`, { name, description });
        toast.success('Category updated');
      } else {
        await API.post('/categories', { name, description });
        toast.success('Category created');
      }
      setShowModal(false);
      setEditId(null);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditId(null); setName(''); setDescription(''); }}>
          <HiOutlinePlusCircle /> Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((cat) => (
          <div key={cat._id} className="category-card">
            <div className="category-info">
              <h3>{cat.name}</h3>
              <p>{cat.description || 'No description'}</p>
            </div>
            <div className="category-actions">
              <button onClick={() => handleEdit(cat)} className="action-btn edit">
                <HiOutlinePencilSquare />
              </button>
              <button onClick={() => handleDelete(cat._id)} className="action-btn delete">
                <HiOutlineTrash />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="empty-state">
            <p>No categories yet</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
