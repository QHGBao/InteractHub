import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">InteractHub</Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link to="/search" className="hover:text-blue-600">Tìm kiếm</Link>
          <Link to="/friends" className="hover:text-blue-600">Bạn bè</Link>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <Link to={`/profile/${user.userId}`}>
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
            </Link>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
        <Link to="/" className="flex flex-col items-center text-xs text-gray-600">
          <span>🏠</span><span>Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center text-xs text-gray-600">
          <span>🔍</span><span>Tìm kiếm</span>
        </Link>
        <Link to="/friends" className="flex flex-col items-center text-xs text-gray-600">
          <span>👥</span><span>Bạn bè</span>
        </Link>
        <Link to={`/profile/${user?.userId}`} className="flex flex-col items-center text-xs text-gray-600">
          <span>👤</span><span>Hồ sơ</span>
        </Link>
      </div>
    </nav>
  );
};
export default Navbar;