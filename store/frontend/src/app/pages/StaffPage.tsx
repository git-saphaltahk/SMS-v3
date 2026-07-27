import { useState } from 'react';
import { getProductImageUrl } from '../services/api';

export interface StaffPageProps {
  currentUser: { name: string; email: string };
  products: any[];
  onCompleteSale: (order: any, updatedProducts: any[]) => void;
  onLogout: () => void;
}

export default function StaffPage({ currentUser, products, onCompleteSale, onLogout }: StaffPageProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [saleError, setSaleError] = useState<string | null>(null);

  const addItem = (product: any) => {
    if (product.stock <= 0) {
      return;
    }

    const existing = selectedItems.find((item) => item.id === product.id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
  };

  const removeItem = (productId: number) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== productId));
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setSelectedItems(
        selectedItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const completeTransaction = async () => {
    if (!customerEmail || selectedItems.length === 0) {
      return;
    }

    const outOfStock = selectedItems.some((item) => {
      const product = products.find((product) => product.id === item.id);
      return !product || item.quantity > product.stock;
    });

    if (outOfStock) {
      setSaleError('One or more items are out of stock.');
      return;
    }

    setSaleError(null);
    const subtotal = selectedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const grandTotal = subtotal - discountAmount;

    const order = {
      id: Date.now(),
      customer: customerEmail,
      items: selectedItems,
      total: grandTotal,
      subtotal,
      discountPercent,
      discountAmount,
      date: new Date().toLocaleString(),
      status: 'completed',
      staffMember: currentUser.email,
    };

    const updatedProducts = products.map((product) => {
      const item = selectedItems.find((selected) => selected.id === product.id);
      if (!item) return product;
      return { ...product, stock: Math.max(product.stock - item.quantity, 0) };
    });

    try {
      await onCompleteSale(order, updatedProducts);
      setTransactions((current) => [...current, order]);
      setSelectedItems([]);
      setCustomerEmail("");
      setDiscountPercent(0);
    } catch (err: any) {
      setSaleError(err.message || 'Sale failed. Please try again.');
    }
  };

  const subtotal = selectedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl">Family Store - Staff POS</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm">{currentUser.email}</span>
            <button onClick={onLogout} className="text-sm text-blue-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="text-xl mb-4">Select Products</h2>
          <div className="bg-white p-4 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  disabled={product.stock <= 0}
                  className={`p-3 rounded text-left border ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-blue-100'}`}
                >
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-600">${product.price.toFixed(2)}</p>
                  <p className="text-xs mt-1">Stock: {product.stock}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl mb-4">Current Transaction</h2>
          <div className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="block text-sm mb-2">Customer Email:</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                placeholder="customer@email.com"
              />
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-2">Items ({selectedItems.length})</h3>
              {selectedItems.length === 0 ? (
                <p className="text-xs text-gray-500">No items selected</p>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">{item.name}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-2">Discount (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
                placeholder="0"
              />
            </div>

            <div className="border-t pt-4 mb-4">
              {subtotal > 0 && (
                <div className="text-xs text-gray-500 mb-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between font-bold mb-3">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {saleError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                  {saleError}
                </div>
              )}
              <button
                onClick={completeTransaction}
                disabled={selectedItems.length === 0 || !customerEmail}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-semibold"
              >
                Complete Sale
              </button>
            </div>

            {transactions.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Recent Transactions:</h3>
                <div className="space-y-2 text-xs">
                  {transactions.slice(-3).map((txn) => (
                    <div key={txn.id} className="bg-green-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span>TXN #{txn.id}</span>
                        <span className="font-semibold">${txn.total.toFixed(2)}</span>
                      </div>
                      <div className="text-gray-600">{txn.customer}</div>
                      <div className="text-gray-500">{txn.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
