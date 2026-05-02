import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import AdminRoute from './components/Shared/AdminRoute';
import LoadingSpinner from './components/Shared/LoadingSpinner';
import MainLayout from './layouts/MainLayout';

const LoginPage        = lazy(() => import('./pages/LoginPage'));
const RegisterPage     = lazy(() => import('./pages/RegisterPage'));
const HomePage         = lazy(() => import('./pages/HomePage'));
const ProfilePage      = lazy(() => import('./pages/ProfilePage'));
const SearchPage       = lazy(() => import('./pages/SearchPage'));
const StoriesPage      = lazy(() => import('./pages/StoriesPage'));
const FriendPage       = lazy(() => import('./pages/FriendPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const SettingPage      = lazy(() => import('./pages/SettingPage'));
const HashtagPage      = lazy(() => import('./pages/HashtagPage'));
const PostDetailPage   = lazy(() => import('./pages/PostDetailPage'));

// Admin pages                                                    // ← thêm
const ReportListPage   = lazy(() => import('./pages/admin/ReportListPage'));
const ReportDetailPage = lazy(() => import('./pages/admin/ReportDetailPage'));
const UserListPage     = lazy(() => import('./pages/admin/UserListPage'));

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* User + Admin routes — dùng chung MainLayout */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/post/:id"                element={<PostDetailPage />} />
                <Route path="/"                        element={<HomePage />} />
                <Route path="/profile/:userId"         element={<ProfilePage />} />
                <Route path="/search"                  element={<SearchPage />} />
                <Route path="/stories"                 element={<StoriesPage />} />
                <Route path="/friends"                 element={<FriendPage />} />
                <Route path="/notifications"           element={<NotificationPage />} />
                <Route path="/settings"                element={<SettingPage />} />
                <Route path="/hashtag/:tag"            element={<HashtagPage />} />

                {/* Admin — thêm AdminRoute bên trong để check role */}
                <Route path="/admin"                   element={<Navigate to="/admin/reports" replace />} />
                <Route path="/admin/reports"           element={<AdminRoute><ReportListPage /></AdminRoute>} />
                <Route path="/admin/reports/:reportId" element={<AdminRoute><ReportDetailPage /></AdminRoute>} />
                <Route path="/admin/users"             element={<AdminRoute><UserListPage /></AdminRoute>} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;