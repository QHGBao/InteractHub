import Avatar from "./Avatar";
import Icon from "./Icon";

export default function Sidebar({ page, currentUser, onNavigate, sidebarOpen, onLogout }) {
  const isAdminPage = page === 'admin-reports' || page === 'admin-users';

  const NAV = [
    {
      section: "Menu",
      items: [
        { id: "home",          icon: "home",  label: "Trang chủ" },
        { id: "friends",       icon: "users", label: "Bạn bè" },
        { id: "stories",       icon: "book",  label: "Stories" },
        { id: "notifications", icon: "bell",  label: "Thông báo" },
      ],
    },
    {
      section: "Khác",
      items: [
        { id: "profile",  icon: "user",     label: "Trang cá nhân" },
        { id: "settings", icon: "settings", label: "Cài đặt" },
      ],
    },
  ];

  const ADMIN_NAV = [
    { id: "admin-reports", icon: "flag",   label: "Báo cáo bài viết" },
    { id: "admin-users",   icon: "shield", label: "Quản lý người dùng" },
  ];

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        InteractHub
        <span>SOCIAL PLATFORM</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(sec => (
          <div key={sec.section} className="nav-section">
            <div className="nav-section-title">{sec.section}</div>
            {sec.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}

        {/* Admin section — chỉ hiện với Role Admin */}
        {currentUser?.role === 'Admin' && (
          <div className="nav-section">
            <div className="nav-section-title">Admin</div>
            {ADMIN_NAV.map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-user">
        <Avatar user={currentUser} size="sm" />
        <div className="info">
          <div className="name">{currentUser?.displayName || currentUser?.name}</div>
          <div className="role">{currentUser?.role}</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent3)' }} />
      </div>

      {onLogout && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onLogout}
          style={{ margin: '8px 12px 0', width: 'calc(100% - 24px)', justifyContent: 'flex-start', gap: 10, color: 'var(--text3)' }}
        >
          <Icon name="logout" size={16} />
          Đăng xuất
        </button>
      )}
    </div>
  );
}