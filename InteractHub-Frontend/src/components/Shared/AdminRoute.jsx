import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Shared/LoadingSpinner';

// Bọc các route chỉ dành cho Admin
// Dùng: <Route element={<AdminRoute />}>...</Route>
const AdminRoute = ({ children }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'Admin') return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
