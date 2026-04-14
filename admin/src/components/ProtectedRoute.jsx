import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>You don't have admin privileges.</p>
      </div>
    );
  }

  return children;
}
