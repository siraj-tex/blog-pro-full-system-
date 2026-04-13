import { HiOutlineBars3 } from 'react-icons/hi2';

export default function Header({ onMenuClick, title }) {
  return (
    <header className="admin-header">
      <button className="menu-btn" onClick={onMenuClick}>
        <HiOutlineBars3 />
      </button>
      <h1 className="header-title">{title}</h1>
    </header>
  );
}
