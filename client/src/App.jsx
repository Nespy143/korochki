import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './Layout';
// import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ApplicationsPage from './pages/ApplicationsPage';
import NewApplicationPage from './pages/NewApplicationPage';
import AdminPage from './pages/AdminPage';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route index element={<HomePage />} /> */}
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          
          <Route path="applications" element={<PrivateRoute />}>
            <Route index element={<ApplicationsPage />} />
            <Route path="new" element={<NewApplicationPage />} />
          </Route>
          
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
          </Route>
          
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" />;
}

function AdminRoute() {
  const { user } = useAuth();
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" />;
}

export default App;