import { useEffect, useState } from 'react';
import { promotionsApi } from '../services/api';

export interface AdminPageProps {
  currentUser: { name: string; email: string };
  products: any[];
  orders: any[];
  onAddProduct: (product: any) => void;
  onUpdateProduct: (product: any) => void;
  onDeleteProduct?: (productId: number) => void;
  onDeleteUser?: (userId: number) => void;
  onRefreshUsers?: () => Promise<void>;
  allUsers?: any[];
  onLogout: () => void;
}

export default function AdminPage({
  currentUser,
  products,
  orders,
  allUsers = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDeleteUser,
  onRefreshUsers,
  onLogout,
}: AdminPageProps) {
  const [view, setView] = useState<'products' | 'users' | 'orders' | 'promotions'>('products');

  const handleViewChange = (newView: 'products' | 'users' | 'orders' | 'promotions') => {
    setView(newView);
    if (newView === 'users' && onRefreshUsers) {
      onRefreshUsers();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl">Family Store - Admin Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm">{currentUser.email}</span>
            <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-4">
          <button
            onClick={() => handleViewChange("products")}
            className={`px-4 py-2 ${view === "products" ? "border-b-2 border-blue-600" : ""}`}
          >
            Products
          </button>
          <button
            onClick={() => handleViewChange("users")}
            className={`px-4 py-2 ${view === "users" ? "border-b-2 border-blue-600" : ""}`}
          >
            Users
          </button>
          <button
            onClick={() => handleViewChange("orders")}
            className={`px-4 py-2 ${view === "orders" ? "border-b-2 border-blue-600" : ""}`}
          >
            Orders
          </button>
          <button
            onClick={() => handleViewChange("promotions")}
            className={`px-4 py-2 ${view === "promotions" ? "border-b-2 border-blue-600" : ""}`}
          >
            Promotions
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
        {view === "products" && (
          <ProductsView
            products={products}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
          />
        )}
        {view === "users" && <UsersView users={allUsers} onDeleteUser={onDeleteUser} />}
        {view === "orders" && <OrdersView orders={orders} />}
        {view === "promotions" && <PromotionsView />}
      </main>
    </div>
  );
}

function ProductsView({ products, onUpdateProduct, onAddProduct, onDeleteProduct }: { products: any[]; onUpdateProduct: (product: any) => void; onAddProduct: (product: any) => void; onDeleteProduct?: (productId: number) => void }) {
  const [newProduct, setNewProduct] = useState({ name: '', category: 'men', price: 0, stock: 0 });
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
              <th className="px-4 py-2 text-left">Action</th>
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDeleteProduct?.(product.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView({ users, onDeleteUser }: { users: any[]; onDeleteUser?: (userId: number) => void }) {
  return (
    <div>
      <h2 className="text-xl mb-4">Users</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDeleteUser?.(user.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromotionsView() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discountType: 'PERCENT', discountValue: 10, minOrderSubtotal: 20, maxDiscountAmount: 20, active: true });
  const [ruleForm, setRuleForm] = useState({ name: 'Family Rewards', description: 'Earn and redeem points on every order', pointsPerDollar: 1, currencyPerPoint: 0.01, maxPointsPerOrder: 1000, active: true });

  const loadPromotions = async () => {
    const [couponData, ruleData] = await Promise.all([
      promotionsApi.getCoupons(),
      promotionsApi.getLoyaltyRules(),
    ]);
    setCoupons(couponData);
    setRules(ruleData);
  };

  useEffect(() => {
    loadPromotions().catch((error) => console.error('Failed to load promotions:', error));
  }, []);

  const submitCoupon = async () => {
    await promotionsApi.createCoupon(couponForm);
    setCouponForm({ code: '', description: '', discountType: 'PERCENT', discountValue: 10, minOrderSubtotal: 20, maxDiscountAmount: 20, active: true });
    await loadPromotions();
  };

  const submitRule = async () => {
    await promotionsApi.createLoyaltyRule(ruleForm);
    setRuleForm({ name: 'Family Rewards', description: 'Earn and redeem points on every order', pointsPerDollar: 1, currencyPerPoint: 0.01, maxPointsPerOrder: 1000, active: true });
    await loadPromotions();
  };

  const deleteCoupon = async (id: number) => {
    await promotionsApi.deleteCoupon(id);
    await loadPromotions();
  };

  const deleteRule = async (id: number) => {
    await promotionsApi.deleteLoyaltyRule(id);
    await loadPromotions();
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-4">Coupons</h2>
          <div className="grid gap-2 mb-4">
            <input value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="Coupon code" className="border rounded px-3 py-2" />
            <input value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} placeholder="Description" className="border rounded px-3 py-2" />
            <select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })} className="border rounded px-3 py-2">
              <option value="PERCENT">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
            <input type="number" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} placeholder="Discount value" className="border rounded px-3 py-2" />
            <input type="number" value={couponForm.minOrderSubtotal} onChange={(e) => setCouponForm({ ...couponForm, minOrderSubtotal: Number(e.target.value) })} placeholder="Min order subtotal" className="border rounded px-3 py-2" />
            <input type="number" value={couponForm.maxDiscountAmount} onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: Number(e.target.value) })} placeholder="Max discount amount" className="border rounded px-3 py-2" />
            <button onClick={submitCoupon} className="bg-blue-600 text-white px-4 py-2 rounded">Create Coupon</button>
          </div>
          <div className="space-y-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">{coupon.code}</div>
                  <div>{coupon.description}</div>
                  <div>{coupon.discountType} • {coupon.discountValue}</div>
                </div>
                <button onClick={() => deleteCoupon(coupon.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-4">Loyalty Rules</h2>
          <div className="grid gap-2 mb-4">
            <input value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} placeholder="Rule name" className="border rounded px-3 py-2" />
            <input value={ruleForm.description} onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })} placeholder="Description" className="border rounded px-3 py-2" />
            <input type="number" value={ruleForm.pointsPerDollar} onChange={(e) => setRuleForm({ ...ruleForm, pointsPerDollar: Number(e.target.value) })} placeholder="Points per dollar" className="border rounded px-3 py-2" />
            <input type="number" step="0.01" value={ruleForm.currencyPerPoint} onChange={(e) => setRuleForm({ ...ruleForm, currencyPerPoint: Number(e.target.value) })} placeholder="Currency per point" className="border rounded px-3 py-2" />
            <input type="number" value={ruleForm.maxPointsPerOrder} onChange={(e) => setRuleForm({ ...ruleForm, maxPointsPerOrder: Number(e.target.value) })} placeholder="Max points per order" className="border rounded px-3 py-2" />
            <button onClick={submitRule} className="bg-green-600 text-white px-4 py-2 rounded">Create Rule</button>
          </div>
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">{rule.name}</div>
                  <div>{rule.description}</div>
                  <div>{rule.pointsPerDollar} pts / $1 • {rule.currencyPerPoint} USD / pt</div>
                </div>
                <button onClick={() => deleteRule(rule.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders }: { orders: any[] }) {
  const parseItems = (order: any) => {
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
