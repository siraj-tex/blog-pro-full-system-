import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineHome, 
  HiOutlineDocumentText, 
  HiOutlinePlusCircle, 
  HiOutlineTag, 
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBell
} from 'react-icons/hi2';

export default function Sidebar({ isOpen, onClose }) {
  const { dbUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/posts', icon: <HiOutlineDocumentText />, label: 'Posts' },
    { to: '/posts/create', icon: <HiOutlinePlusCircle />, label: 'New Post' },
    { to: '/categories', icon: <HiOutlineTag />, label: 'Categories' },
    { to: '/comments', icon: <HiOutlineChatBubbleLeftRight />, label: 'Comments' },
    { to: '/notifications', icon: <HiOutlineBell />, label: 'Notifications' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <span className="logo-text">Nova<span className="logo-accent">Byte</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {dbUser?.photoURL ? (
                <img src={dbUser.photoURL} alt={dbUser.displayName} />
              ) : (
                <span>{dbUser?.displayName?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="user-details">
              <span className="user-name">{dbUser?.displayName || 'Admin'}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <HiOutlineArrowRightOnRectangle />
          </button>
        </div>
      </aside>
    </>
  );
}
