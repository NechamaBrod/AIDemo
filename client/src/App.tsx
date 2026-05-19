import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductCreatePage from './pages/ProductCreatePage';
import CustomerHomePage from './pages/CustomerHomePage';
import ProtectedRoute from './components/ProtectedRoute';
import { getSession } from './services/authService';

/* שורש: אדמין/מנהל → דשבורד; כל השאר (כולל אורחים) → חנות */
const RootRedirect = () => {
  const session = getSession();
  if (session && (session.role === 'admin' || session.role === 'manager')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/shop" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        {/* דשבורד ניהולי - admin/manager בלבד */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        {/* דף ציבורי להצגת מוצרים */}
        <Route path="/products" element={<ProductListPage />} />
        {/* מסך לקוח / חנות - ציבורי */}
        <Route path="/shop" element={<CustomerHomePage />} />
        {/* יצירת מוצר - admin בלבד */}
        <Route
          path="/products/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <ProductCreatePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
