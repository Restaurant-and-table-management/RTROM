import { Navigate, Route, Routes } from 'react-router-dom';
import AuthRedirectRoute from './components/routing/AuthRedirectRoute';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleHomeRedirect from './components/routing/RoleHomeRedirect';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminTablesPage from './pages/admin/AdminTablesPage';
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import CustomerReservationsPage from './pages/customer/CustomerReservationsPage';
import KitchenPage from './pages/kitchen/KitchenPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WaiterPage from './pages/waiter/WaiterPage';
import { ROLES } from './utils/roleRoutes';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthRedirectRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/home" element={<RoleHomeRedirect />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/tables" element={<AdminTablesPage />} />
          <Route path="/admin/reservations" element={<AdminReservationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/customer" element={<CustomerDashboardPage />} />
          <Route path="/customer/menu" element={<CustomerMenuPage />} />
          <Route path="/customer/reservations" element={<CustomerReservationsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.KITCHEN_STAFF]} />}>
          <Route path="/kitchen" element={<KitchenPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.WAITER]} />}>
          <Route path="/waiter" element={<WaiterPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
