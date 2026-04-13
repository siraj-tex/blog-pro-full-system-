import { useState, useEffect } from 'react';
import API from '../config/api';
import toast from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi2';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data } = await API.get('/comments');
      setComments(data.comments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${id}`);
      setComments(comments.filter((c) => c._id !== id));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  return (
    <div className="comments-page">
      <h1 className="page-title">Comments</h1>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-card">
            <div className="comment-header">
              <div className="comment-user">
                <div className="comment-avatar">
                  {comment.user?.photoURL ? (
                    <img src={comment.user.photoURL} alt="" />
                  ) : (
                    <span>{comment.user?.displayName?.charAt(0) || '?'}</span>
                  )}
                </div>
                <div>
                  <span className="comment-name">{comment.user?.displayName || 'Unknown'}</span>
                  <span className="comment-meta">
                    on <strong>{comment.post?.title || 'Deleted Post'}</strong> · {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteComment(comment._id)} className="action-btn delete">
                <HiOutlineTrash />
              </button>
            </div>
            <p className="comment-content">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="empty-state">
            <p>No comments yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
