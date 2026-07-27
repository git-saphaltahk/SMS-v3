import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage, { CustomerLoginPage, StaffAdminManagerLoginPage } from './pages/LoginPage';
import { CustomerRegisterPage, StaffRegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordResetPage';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';
import ManagerPage from './pages/ManagerPage';
import StaffPage from './pages/StaffPage';
import { PaymentCheckoutPage } from './pages/PaymentCheckoutPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailurePage } from './pages/PaymentFailurePage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';

export const routePaths = {
  home: '/',
  login: '/login',
  loginCustomer: '/login/customer',
  loginStaffAdmin: '/login/staff',
  registerCustomer: '/register/customer',
  registerStaff: '/register/staff',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  customer: '/customer',
  staff: '/staff',
  admin: '/admin',
  manager: '/manager',
  paymentCheckout: '/payment/checkout',
  paymentSuccess: '/payment/success',
  paymentFailure: '/payment/failure',
} as const;

export type RoutePath = (typeof routePaths)[keyof typeof routePaths];

export const routeLabels: Record<RoutePath, string> = {
  [routePaths.home]: 'Home',
  [routePaths.login]: 'Login',
  [routePaths.loginCustomer]: 'Customer Login',
  [routePaths.loginStaffAdmin]: 'Staff / Admin / Manager Login',
  [routePaths.registerCustomer]: 'Customer Register',
  [routePaths.registerStaff]: 'Staff Register',
  [routePaths.forgotPassword]: 'Forgot Password',
  [routePaths.resetPassword]: 'Reset Password',
  [routePaths.customer]: 'Customer',
  [routePaths.staff]: 'Staff',
  [routePaths.admin]: 'Admin',
  [routePaths.manager]: 'Manager',
  [routePaths.paymentCheckout]: 'Checkout',
  [routePaths.paymentSuccess]: 'Payment Success',
  [routePaths.paymentFailure]: 'Payment Failed',
};

export interface AppRoutesProps {
  userType: string | null;
  currentUser: any;
  products: any[];
  orders: any[];
  authError: string | null;
  onLoginSuccess: (type: string, userName: string, userEmail: string) => void;
  onLogout: () => void;
  onAddProduct: (product: any) => void;
  onUpdateProduct: (product: any) => void;
  onDeleteProduct?: (productId: number) => void;
  onCompleteSale: (order: any, updatedProducts: any[]) => Promise<void> | void;
  onDeleteUser?: (userId: number) => void;
  onRefreshUsers?: () => Promise<void>;
  allUsers?: any[];
}

function getDashboardRoute(userType: string | null): string {
  if (userType === 'customer') return routePaths.customer;
  if (userType === 'admin') return routePaths.admin;
  if (userType === 'manager') return routePaths.manager;
  if (userType === 'staff' || userType === 'cashier') return routePaths.staff;
  return routePaths.login;
}

export default function AppRoutes({ userType, currentUser, products, orders, authError, onLoginSuccess, onLogout, onAddProduct, onUpdateProduct, onDeleteProduct, onCompleteSale, onDeleteUser, onRefreshUsers, allUsers }: AppRoutesProps) {
  const dashboardRoute = getDashboardRoute(userType);

  return (
    <Routes>
      <Route
        path={routePaths.home}
        element={<HomePage />}
      />
      <Route
        path="/product/:id"
        element={<ProductDetailPage />}
      />
      <Route
        path={routePaths.login}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <LoginPage />}
      />
      <Route
        path={routePaths.loginCustomer}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <CustomerLoginPage onLoginSuccess={onLoginSuccess} authError={authError} />}
      />
      <Route
        path={routePaths.loginStaffAdmin}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <StaffAdminManagerLoginPage onLoginSuccess={onLoginSuccess} authError={authError} />}
      />
      <Route
        path={routePaths.registerCustomer}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <CustomerRegisterPage onRegisterSuccess={onLoginSuccess} onBack={() => window.location.href = '/'} />}
      />
      <Route
        path={routePaths.registerStaff}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <StaffRegisterPage onRegisterSuccess={onLoginSuccess} onBack={() => window.location.href = '/'} />}
      />
      <Route
        path={routePaths.forgotPassword}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <ForgotPasswordPage onBack={() => window.location.href = '/'} />}
      />
      <Route
        path={routePaths.resetPassword}
        element={userType ? <Navigate to={dashboardRoute} replace /> : <ResetPasswordPage onBack={() => window.location.href = '/'} />}
      />
      <Route
        path={routePaths.customer}
        element={userType === 'customer' ? <CustomerPage currentUser={currentUser} onLogout={onLogout} products={products} orders={orders} onCreateOrder={onCompleteSale} /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.admin}
        element={userType === 'admin' ? <AdminPage currentUser={currentUser} products={products} orders={orders} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} onDeleteProduct={onDeleteProduct} onLogout={onLogout} allUsers={allUsers} onDeleteUser={onDeleteUser} onRefreshUsers={onRefreshUsers} /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.manager}
        element={userType === 'manager' ? <ManagerPage currentUser={currentUser} products={products} orders={orders} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} onLogout={onLogout} allUsers={allUsers} onRefreshUsers={onRefreshUsers} /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.staff}
        element={userType === 'staff' || userType === 'cashier' ? <StaffPage currentUser={currentUser} products={products} onCompleteSale={onCompleteSale} onLogout={onLogout} /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.paymentCheckout}
        element={userType === 'customer' ? <PaymentCheckoutPage /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.paymentSuccess}
        element={userType === 'customer' ? <PaymentSuccessPage /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path={routePaths.paymentFailure}
        element={userType === 'customer' ? <PaymentFailurePage /> : <Navigate to={routePaths.login} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={userType ? dashboardRoute : routePaths.login} replace />}
      />
    </Routes>
  );
}
