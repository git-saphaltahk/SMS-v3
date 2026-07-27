import { useState } from 'react';

export interface ManagerPageProps {
  currentUser: { name: string; email: string };
  products: any[];
  orders: any[];
  allUsers?: any[];
  onAddProduct: (product: any) => void;
  onUpdateProduct: (product: any) => void;
  onLogout: () => void;
  onRefreshUsers?: () => Promise<void>;
}

export default function ManagerPage({
  currentUser,
  products,
  orders,
  allUsers = [],
  onAddProduct,
  onUpdateProduct,
  onLogout,
  onRefreshUsers,
}: ManagerPageProps) {
  const [view, setView] = useState<'products' | 'users' | 'orders'>('products');

  const handleViewChange = (newView: 'products' | 'users' | 'orders') => {
    setView(newView);
    if (newView === 'users' && onRefreshUsers) {
      onRefreshUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl">Family Store - Manager Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">{currentUser.email}</span>
            <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-4">
          <button
            onClick={() => handleViewChange('products')}
            className={`px-4 py-2 ${view === 'products' ? 'border-b-2 border-blue-600' : ''}`}
          >
            Products
          </button>
          <button
            onClick={() => handleViewChange('users')}
            className={`px-4 py-2 ${view === 'users' ? 'border-b-2 border-blue-600' : ''}`}
          >
            Users
          </button>
          <button
            onClick={() => handleViewChange('orders')}
            className={`px-4 py-2 ${view === 'orders' ? 'border-b-2 border-blue-600' : ''}`}
          >
            Orders
          </button>
        </div>
        <div className="flex gap-2">
           
            <button
              className="ml-18 px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              className="flex gap-4 px-4 py-1.5 border border-gray-400 rounded text-sm hover:bg-gray-100"
            >
                       Export PDF
            </button>
            </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'products' && (
          <ProductsView products={products} onAddProduct={onAddProduct} onUpdateProduct={onUpdateProduct} />
        )}
        {view === 'users' && <UsersView users={allUsers} />}
        {view === 'orders' && <OrdersView orders={orders} />}
      </main>
    </div>
  );
}

function ProductsView({
  products,
  onUpdateProduct,
  onAddProduct,
}: {
  products: any[];
  onUpdateProduct: (product: any) => void;
  onAddProduct: (product: any) => void;
}) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'men',
    price: 0,
    stock: 0,
  });
  const nextId = products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1;

  const setField = (field: string, value: any) => {
    setNewProduct((current) => ({ ...current, [field]: value }));
  };

  const createProduct = () => {
    if (!newProduct.name.trim() || newProduct.price <= 0) {
      return;
    }

    onAddProduct({
      id: nextId,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
    });
    setNewProduct({ name: '', category: 'men', price: 0, stock: 0 });
  };

  const updateProduct = (product: any, field: string, value: any) => {
    onUpdateProduct({
      ...product,
      [field]: field === 'price' || field === 'stock' ? Number(value) : value,
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl mb-2">Product Catalog</h2>
          <p className="text-sm text-gray-600">Edit any product inline. Changes are saved automatically.</p>
          <p className="text-xs text-gray-500 mt-1">Note: Managers cannot delete products (admin only)</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 w-full sm:w-auto">
          <input
            value={newProduct.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="New product name"
            className="px-3 py-2 border rounded w-full"
          />
          <select
            value={newProduct.category}
            onChange={(e) => setField('category', e.target.value)}
            className="px-3 py-2 border rounded w-full"
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => setField('price', e.target.value)}
            placeholder="Price"
            className="px-3 py-2 border rounded w-full"
          />
          <input
            type="number"
            value={newProduct.stock}
            onChange={(e) => setField('stock', e.target.value)}
            placeholder="Stock"
            className="px-3 py-2 border rounded w-full"
          />
        </div>
        <button
          onClick={createProduct}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="px-4 py-3">{product.id}</td>
                <td className="px-4 py-3">
                  <input
                    value={product.name}
                    onChange={(e) => updateProduct(product, 'name', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={product.category}
                    onChange={(e) => updateProduct(product, 'category', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => updateProduct(product, 'price', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateProduct(product, 'stock', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView({ users }: { users: any[] }) {
  return (
    <div>
      <h2 className="text-xl mb-4">Users</h2>
      <p className="text-sm text-gray-600 mb-4">View-only access for managers</p>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrdersView({ orders }: { orders: any[] }) {
  const parseItems = (order: any) => {
    // itemsJson is a JSON string from backend, items is local array
    if (Array.isArray(order.items)) return order.items;
    if (order.itemsJson) {
      try { return JSON.parse(order.itemsJson); } catch { return []; }
    }
    return [];
  };

  const formatTotal = (order: any) => {
    const t = order.total || order.grandTotal;
    if (t == null) return '0.00';
    return typeof t === 'number' ? t.toFixed(2) : parseFloat(t).toFixed(2);
  };

  return (
    <div>
      <h2 className="text-xl mb-4">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const items = parseItems(order);
            return (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between mb-2">
                <div>
                  <span>Order #{order.id}</span>
                  <span className="ml-4 text-sm text-gray-600">
                    Customer: {order.customerEmail || order.customer || 'N/A'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {order.date || order.createdAt || ''}
                </span>
              </div>
              <div className="mb-2">
                {items.map((item: any, i: number) => (
                  <div key={item.productId || item.id || i} className="text-sm">
                    {item.productName || item.name} x {item.quantity} = $
                    {((item.unitPriceAtTime || item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span>Status: {order.status || order.orderStatus || 'N/A'}</span>
                <span className="text-lg">Total: ${formatTotal(order)}</span>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
