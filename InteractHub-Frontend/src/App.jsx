import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import LoadingSpinner from './components/Shared/LoadingSpinner';
import MainLayout from './layouts/MainLayout';


const LoginPage    = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const HomePage     = lazy(() => import('./pages/HomePage'));
const ProfilePage  = lazy(() => import('./pages/ProfilePage'));
const SearchPage   = lazy(() => import('./pages/SearchPage'));
const StoriesPage  = lazy(() => import('./pages/StoriesPage'));
const FriendPage   = lazy(() => import('./pages/FriendPage'));
const NotificationPage   = lazy(() => import('./pages/NotificationPage'));
const SettingPage  = lazy(() => import('./pages/SettingPage'));
const AdminPage    = lazy(() => import('./pages/AdminPage'))

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppProvider>                  
        <NotificationProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/"                element={<HomePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/search"          element={<SearchPage />} />
                <Route path="/stories"         element={<StoriesPage />} />
                <Route path="/friends"         element={<FriendPage/>} />
                <Route path="/notifications"   element={<NotificationPage/>} />
                <Route path="/settings"        element={<SettingPage/>} />
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