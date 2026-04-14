import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import API from '../config/api';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await API.post('/upload', formData);
      setCoverImage(data.url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      return toast.error('Title and content are required');
    }

    setSaving(true);
    try {
      await API.post('/posts', {
        title,
        content,
        excerpt,
        coverImage,
        category: category || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      });
      toast.success('Post created!');
      navigate('/posts');
    } catch (error) {
      toast.error('Failed to create post');
    }
    setSaving(false);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="create-post-page">
      <h1 className="page-title">Create New Post</h1>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-main">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Write your post content..."
              className="quill-editor"
            />
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-sidebar">
          <div className="form-card">
            <h3>Publish</h3>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving...' : status === 'published' ? 'Publish Post' : 'Save Draft'}
            </button>
          </div>

          <div className="form-card">
            <h3>Cover Image</h3>
            {coverImage && (
              <img src={coverImage} alt="Cover" className="cover-preview" />
            )}
            <label className="file-upload-btn">
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
          </div>

          <div className="form-card">
            <h3>Category</h3>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-card">
            <h3>Tags</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
