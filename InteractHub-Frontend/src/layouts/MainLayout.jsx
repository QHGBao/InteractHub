import { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Shared/Sidebar';
import Avatar from '../components/Shared/Avatar';
import Icon from '../components/Shared/Icon';
import Toasts from '../components/Shared/Toasts';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';

const PAGE_TITLES = {
  '/': 'Trang chủ',
  '/friends': 'Bạn bè',
  '/stories': 'Stories',
  '/notifications': 'Thông báo',
  '/settings': 'Cài đặt',
  '/profile': 'Trang cá nhân',
  '/search': 'Tìm kiếm',
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { toast, toasts } = useApp(); // 👈 thêm toasts
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef(null);
  const { unreadCount } = useNotifications();

  const pathToPage = {
    '/': 'home',
    '/friends': 'friends',
    '/stories': 'stories',
    '/notifications': 'notifications',
    '/settings': 'settings',
    '/search': 'search',
  };

  const currentPage = location.pathname.startsWith('/profile')
    ? 'profile'
    : (pathToPage[location.pathname] || 'home');

  function handleNavigate(pageId) {
    const pageToPath = {
      home: '/',
      friends: '/friends',
      stories: '/stories',
      notifications: '/notifications',
      profile: `/profile/${user?.userId}`,
      settings: '/settings',
      admin: '/admin',
    };
    navigate(pageToPath[pageId] || '/');
    setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
    navigate('/login');
    toast('Đã đăng xuất!', 'success');
  }

  const title = location.pathname.startsWith('/profile')
    ? 'Trang cá nhân'
    : (PAGE_TITLES[location.pathname] || 'InteractHub');

  return (
    <div className="app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        page={currentPage}
        currentUser={user}
        onNavigate={handleNavigate}
        sidebarOpen={sidebarOpen}
        onLogout={handleLogout}
      />

      <div className="main">
        <div className="topbar">
          <button
            className="btn btn-ghost btn-sm sidebar-toggle"
            onClick={() => setSidebarOpen(p => !p)}
          >
            <Icon name="menu" size={20} />
          </button>

          <span className="topbar-title">{title}</span>

          <div className="search-wrap" ref={searchRef}>
            <div className="search-icon">
              <Icon name="search" size={15} />
            </div>
            <input
              placeholder="Tìm kiếm ..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchVal.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchVal)}`);
                  setSearchVal('');
                }
              }}
            />
          </div>

          <button
            className="btn btn-ghost btn-sm topbar-icon"
            onClick={() => navigate('/notifications')}
            style={{ position: 'relative' }}
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2, right: 2,
                background: 'red',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                borderRadius: '50%',
                width: 16, height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div
            className="topbar-avatar"
            onClick={() => navigate(`/profile/${user?.userId}`)}
            style={{ cursor: 'pointer' }}
          >
            <Avatar user={user} size="sm" />
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
      <Toasts toasts={toasts} />
    </div>
  );
};

export default MainLayout;