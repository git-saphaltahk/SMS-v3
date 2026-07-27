import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { allProducts as defaultProducts } from './data/products';
import { authService } from './services/auth';
import { productsApi, ordersApi, usersApi } from './services/api';

export default function App() {
  const [userType, setUserType] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>(() => {
    const stored = localStorage.getItem('smsProducts');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultProducts;
      }
    }
    return defaultProducts;
  });
  const [orders, setOrders] = useState<any[]>(() => {
    const stored = localStorage.getItem('smsOrders');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isAuthRestored, setIsAuthRestored] = useState(false);

  // Restore auth state from localStorage on page load (e.g., after Stripe redirect)
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        // Decode JWT payload to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = String(payload.role || '').toLowerCase();
        const mappedRole = role === 'cashier' ? 'staff' : role;
        setUserType(mappedRole);
        setCurrentUser({ name: payload.sub, email: payload.sub });
      } catch (e) {
        console.error('Failed to restore auth state:', e);
        authService.clearToken();
      }
    }
    setIsAuthRestored(true);
  }, []);

  // Load products, orders, and users from backend API when user logs in
  useEffect(() => {
    const loadDataFromBackend = async () => {
      if (authService.isAuthenticated()) {
        setIsLoadingData(true);
        try {
          const backendProducts = await productsApi.getAll();
          if (backendProducts && backendProducts.length > 0) {
            setProducts(backendProducts);
            localStorage.setItem('smsProducts', JSON.stringify(backendProducts));
          }
        } catch (error) {
          console.log('Products from backend not available, using local data:', error);
        }

        try {
          const backendOrders = await ordersApi.getAll();
          if (backendOrders && backendOrders.length > 0) {
            setOrders(backendOrders);
            localStorage.setItem('smsOrders', JSON.stringify(backendOrders));
          }
        } catch (error) {
          console.log('Orders from backend not available, using local data:', error);
        }

        try {
          const backendUsers = await usersApi.getAll();
          if (backendUsers && backendUsers.length > 0) {
            setUsers(backendUsers);
          }
        } catch (error) {
          console.log('Users from backend not available:', error);
        }
        setIsLoadingData(false);
      }
    };

    loadDataFromBackend();
  }, [userType]);

  useEffect(() => {
    localStorage.setItem('smsProducts', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('smsOrders', JSON.stringify(orders));
  }, [orders]);

  const handleLogin = async (type: string, userName: string, userEmail: string) => {
    setUserType(type);
    setCurrentUser({ name: userName, email: userEmail });
  };

  const handleLogout = () => {
    authService.clearToken();
    setUserType(null);
    setCurrentUser(null);
    setAuthError(null);
  };

  const handleAddProduct = async (product: any) => {
    try {
      // Try to add to backend
      const newProduct = await productsApi.create(product);
      setProducts((current) => [...current, newProduct]);
    } catch (error) {
      // Fallback to local if backend fails
      console.log('Adding product locally:', error);
      setProducts((current) => [...current, product]);
    }
  };

  const handleUpdateProduct = async (product: any) => {
    try {
      // Try to update in backend
      const updatedProduct = await productsApi.update(product.id, product);
      setProducts((current) => current.map((item) => item.id === product.id ? updatedProduct : item));
    } catch (error) {
      // Fallback to local if backend fails
      console.log('Updating product locally:', error);
      setProducts((current) => current.map((item) => item.id === product.id ? product : item));
    }
  };

  const handleCompleteSale = async (order: any, updatedProducts: any[]) => {
    // If order was already created in the backend (e.g., customer checkout flow),
    // just update local state without making a duplicate backend call
    if (order._alreadyCreated) {
      setOrders((current) => [...current, order]);
      setProducts(updatedProducts);
      return;
    }

    try {
      // Try to create order in backend
      const newOrder = await ordersApi.create({
        ...order,
        customerEmail: order.customer,
        totalPrice: order.total,
        discountPercent: order.discountPercent,
        itemsJson: JSON.stringify(order.items),
      });
      // Normalize backend response fields for frontend
      const normalizedOrder = {
        ...newOrder,
        id: newOrder.id || newOrder.orderId,
        customerEmail: newOrder.customerEmail || order.customer,
        customer: newOrder.customer || order.customer,
        status: newOrder.status || newOrder.orderStatus,
        total: newOrder.total || newOrder.grandTotal,
        date: newOrder.date || new Date().toLocaleString(),
      };
      setOrders((current) => [...current, normalizedOrder]);
      // Only update products locally if backend succeeded
      setProducts(updatedProducts);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      // Re-throw so the caller (StaffPage) can show the error
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      // Try to delete from backend
      await productsApi.delete(productId);
      setProducts((current) => current.filter((p) => p.id !== productId));
    } catch (error) {
      // Fallback to local if backend fails
      console.log('Deleting product locally:', error);
      setProducts((current) => current.filter((p) => p.id !== productId));
    }
  };

  const handleRefreshUsers = async () => {
    try {
      const backendUsers = await usersApi.getAll();
      if (backendUsers && backendUsers.length > 0) {
        setUsers(backendUsers);
      }
    } catch (error) {
      console.log('Failed to refresh users:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await usersApi.delete(userId);
      setUsers((current) => current.filter((u) => u.id !== userId));
    } catch (error) {
      console.log('Delete user failed:', error);
    }
  };

  if (!isAuthRestored) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        userType={userType}
        currentUser={currentUser}
        products={products}
        orders={orders}
        authError={authError}
        onLoginSuccess={handleLogin}
        onLogout={handleLogout}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onCompleteSale={handleCompleteSale}
        onDeleteUser={handleDeleteUser}
        onRefreshUsers={handleRefreshUsers}
        allUsers={users}
      />
    </BrowserRouter>
  );
}
