import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../config/api';
import toast from 'react-hot-toast';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye, HiOutlinePlusCircle } from 'react-icons/hi2';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await API.get('/posts?status=all&limit=50');
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  return (
    <div className="posts-page">
      <div className="page-header">
        <h1 className="page-title">Posts</h1>
        <Link to="/posts/create" className="btn btn-primary">
          <HiOutlinePlusCircle /> New Post
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="posts-table-wrapper">
        <table className="posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Views</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post._id}>
                <td>
                  <div className="post-title-cell">
                    {post.coverImage && (
                      <img src={post.coverImage} alt="" className="post-thumb" />
                    )}
                    <span>{post.title}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${post.status}`}>{post.status}</span>
                </td>
                <td>{post.views}</td>
                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-btns">
                    <Link to={`/posts/edit/${post._id}`} className="action-btn edit">
                      <HiOutlinePencilSquare />
                    </Link>
                    <button onClick={() => deletePost(post._id)} className="action-btn delete">
                      <HiOutlineTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>No posts found</p>
            <Link to="/posts/create" className="btn btn-primary">Create your first post</Link>
          </div>
        )}
      </div>
    </div>
  );
}
