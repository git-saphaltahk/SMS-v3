import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { getProductImageUrl, ordersApi, productsApi, promotionsApi, reviewsApi } from '../services/api';

export interface CustomerPageProps {
  currentUser: { name: string; email: string };
  products: any[];
  orders: any[];
  onCreateOrder: (order: any, updatedProducts: any[]) => void;
  onLogout: () => void;
}

export default function CustomerPage({ currentUser, products, orders, onCreateOrder, onLogout }: CustomerPageProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<'shop' | 'cart' | 'orders' | 'reviews'>('shop');
  const [cart, setCart] = useState<any[]>(() => {
    const stored = localStorage.getItem('smsCart');
    return stored ? JSON.parse(stored) : [];
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [productRatings, setProductRatings] = useState<Record<number, { avg: number; count: number }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [promotionSummary, setPromotionSummary] = useState<any>({ coupons: [], loyaltyRules: [], preview: null });
  const [promotionPreview, setPromotionPreview] = useState<any>({
    subtotal: 0,
    discountAmount: 0,
    discountPercent: 0,
    grandTotal: 0,
    earnedPoints: 0,
    redeemablePoints: 0,
    loyaltyRuleName: 'Family Rewards',
    couponApplied: false,
  });
  const [promotionLoading, setPromotionLoading] = useState(false);
  const navigate = useNavigate();

  // Sync cart from localStorage (e.g. when items added from ProductDetailPage)
  useEffect(() => {
    const handleCartUpdate = () => {
      const stored = localStorage.getItem('smsCart');
      if (stored) setCart(JSON.parse(stored));
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('smsCart', JSON.stringify(cart));
  }, [cart]);

  // Load review stats for products
  useEffect(() => {
    const loadRatings = async () => {
      const ratings: Record<number, { avg: number; count: number }> = {};
      await Promise.all(
        products.slice(0, 20).map(async (p: any) => {
          try {
            const stats = await reviewsApi.getStats(p.id);
            ratings[p.id] = { avg: stats.averageRating, count: stats.reviewCount };
          } catch {
            ratings[p.id] = { avg: 0, count: 0 };
          }
        })
      );
      setProductRatings(ratings);
    };
    if (products.length > 0) loadRatings();
  }, [products]);

  useEffect(() => {
    const loadPromotionSummary = async () => {
      try {
        const summary = await promotionsApi.getCustomerSummary();
        setPromotionSummary(summary);
        if (summary.preview) {
          setPromotionPreview(summary.preview);
        }
      } catch (error) {
        console.error('Failed to load promotions:', error);
      }
    };

    loadPromotionSummary();
  }, []);

  useEffect(() => {
    const previewPromotions = async () => {
      if (cart.length === 0) {
        setPromotionPreview({
          subtotal: 0,
          discountAmount: 0,
          discountPercent: 0,
          grandTotal: 0,
          earnedPoints: 0,
          redeemablePoints: promotionSummary.preview?.redeemablePoints || 0,
          loyaltyRuleName: promotionSummary.preview?.loyaltyRuleName || 'Family Rewards',
          couponApplied: false,
        });
        return;
      }

      setPromotionLoading(true);
      try {
        const preview = await promotionsApi.preview({
          items: cart.map((item: any) => ({ productId: item.id, quantity: item.quantity })),
          couponCode: couponCode.trim() || undefined,
          redeemPoints: redeemPoints || 0,
        });
        setPromotionPreview(preview);
      } catch (error) {
        console.error('Failed to preview promotions:', error);
      } finally {
        setPromotionLoading(false);
      }
    };

    previewPromotions();
  }, [cart, couponCode, redeemPoints, promotionSummary.preview]);

  const displayProducts = searchResults !== null
    ? searchResults
    : activeCategory === 'all'
      ? products
      : products.filter((product: any) =>
          product.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  const addToCart = (product: any) => {
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item: any) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item: any) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map((item: any) =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const results = await productsApi.search(query, activeCategory !== 'all' ? activeCategory : undefined);
      setSearchResults(results);
    } catch (error) {
      console.error('Product search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    try {
      // Create order via backend API — pass cart items directly
      // (ordersApi.create handles the field mapping internally)
      const response = await ordersApi.create({
        items: cart,
        couponCode: couponCode.trim() || undefined,
        redeemPoints: redeemPoints || 0,
      });
      const orderId = response.orderId || response.id;

      // Update local state
      const order = {
        id: orderId,
        customer: currentUser.email,
        items: cart,
        total: cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        date: new Date().toLocaleString(),
        status: 'pending',
        _alreadyCreated: true, // prevent duplicate backend order creation in handleCompleteSale
      };
      const updatedProducts = products.map((product: any) => {
        const cartItem = cart.find((item: any) => item.id === product.id);
        if (!cartItem) return product;
        return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
      });
      onCreateOrder(order, updatedProducts);
      setCart([]);
      setCouponCode('');
      setRedeemPoints(0);
      localStorage.removeItem('smsCart');

      // Navigate to payment checkout page
      navigate(`/payment/checkout?orderId=${orderId}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl">Family Store - Customer</h1>
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
            onClick={() => setView("shop")}
            className={`px-4 py-2 ${view === "shop" ? "border-b-2 border-blue-600" : ""}`}
          >
            Shop
          </button>
          <button
            onClick={() => setView("cart")}
            className={`px-4 py-2 ${view === "cart" ? "border-b-2 border-blue-600" : ""}`}
          >
            Cart ({cart.length})
          </button>
          <button
            onClick={() => setView("orders")}
            className={`px-4 py-2 ${view === "orders" ? "border-b-2 border-blue-600" : ""}`}
          >
            My Orders
          </button>
          <button
            onClick={() => setView("reviews")}
            className={`px-4 py-2 ${view === "reviews" ? "border-b-2 border-blue-600" : ""}`}
          >
            My Reviews
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'shop' && (
          <ProductShop
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            displayProducts={displayProducts}
            onAddToCart={addToCart}
            navigate={navigate}
            productRatings={productRatings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            searching={searching}
          />
        )}

        {view === "cart" && (
          <CartView
            cart={cart}
            cartTotal={cartTotal}
            checkoutLoading={checkoutLoading}
            promotionLoading={promotionLoading}
            promotionSummary={promotionSummary}
            promotionPreview={promotionPreview}
            couponCode={couponCode}
            redeemPoints={redeemPoints}
            setCouponCode={setCouponCode}
            setRedeemPoints={setRedeemPoints}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onCheckout={checkout}
          />
        )}

        {view === "orders" && (
          <OrdersView
            orders={orders}
            customerEmail={currentUser.email}
          />
        )}

        {view === "reviews" && (
          <MyReviewsView navigate={navigate} />
        )}
      </main>
    </div>
  );
}

function ProductShop({
  activeCategory,
  setActiveCategory,
  displayProducts,
  onAddToCart,
  navigate,
  productRatings,
  searchQuery,
  setSearchQuery,
  onSearch,
  onClearSearch,
  searching,
}: any) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shop</h2>
          <p className="text-sm text-gray-500">Search products powered by Elasticsearch.</p>
        </div>
        <form onSubmit={onSearch} className="flex gap-2 w-full sm:w-auto">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
            placeholder="Search products"
            className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        {["all", "men", "women", "kids"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded font-semibold transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 hover:border-blue-600"
            }`}
          >
            {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <span>{`Showing ${displayProducts.length} products${activeCategory !== 'all' ? ` in ${activeCategory}` : ''}.`}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayProducts.map((product: any) => {
          const rating = productRatings[product.id];
          return (
            <div key={product.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
              {/* Clickable image + name to go to detail */}
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer"
              >
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded mb-3 hover:opacity-90 transition"
                />
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{product.category}</span>
                  {rating && rating.count > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs text-gray-500">{rating.avg.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({rating.count})</span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold mb-1 hover:text-blue-600 transition">{product.name}</h3>
              </div>

              {/* Rating display */}
              {rating && rating.count > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <StarRating rating={rating.avg} size="sm" />
                </div>
              )}

              <p className="text-lg font-bold text-blue-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mb-3">Stock: {product.stock}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm"
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm text-gray-600"
                  title="View details & reviews"
                >
                  📋
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CartView({
  cart,
  cartTotal,
  checkoutLoading,
  promotionLoading,
  promotionSummary,
  promotionPreview,
  couponCode,
  redeemPoints,
  setCouponCode,
  setRedeemPoints,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
}: any) {
  const finalTotal = promotionPreview?.grandTotal ?? cartTotal;

  return (
    <div>
      <h2 className="text-xl mb-4">Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <>
          <div className="bg-white rounded shadow">
            {cart.map((item: any) => (
              <div key={item.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3>{item.name}</h3>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 border rounded"
                    disabled={checkoutLoading}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 border rounded"
                    disabled={checkoutLoading}
                  >
                    +
                  </button>
                  <span className="ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="ml-4 text-red-600 hover:underline"
                    disabled={checkoutLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">Coupons & Loyalty</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Coupon code</label>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SAVE10"
                    className="w-full px-3 py-2 border rounded"
                    disabled={checkoutLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Redeem points</label>
                  <input
                    type="number"
                    min={0}
                    max={promotionPreview?.redeemablePoints || 0}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 border rounded"
                    disabled={checkoutLoading}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Current points balance: <strong>{promotionPreview?.redeemablePoints ?? 0}</strong><br />
                  Reward rule: <strong>{promotionPreview?.loyaltyRuleName || 'Family Rewards'}</strong>
                </div>
                <div className="text-xs text-gray-500">
                  {promotionLoading ? 'Refreshing promotion preview…' : 'Server-side validation runs when checkout is submitted.'}
                </div>
              </div>
              <div className="mt-4 rounded bg-blue-50 p-3 text-sm">
                <div className="font-semibold mb-1">Available coupons</div>
                <div className="flex flex-wrap gap-2">
                  {(promotionSummary?.coupons || []).map((coupon: any) => (
                    <span key={coupon.id} className="bg-white border px-2 py-1 rounded text-xs">
                      {coupon.code} - {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded bg-green-50 p-3 text-sm">
                <div className="font-semibold mb-1">Loyalty rules</div>
                <div className="space-y-1">
                  {(promotionSummary?.loyaltyRules || []).map((rule: any) => (
                    <div key={rule.id} className="bg-white border px-2 py-1 rounded text-xs">
                      {rule.name} • {rule.pointsPerDollar} pts / $1 • {rule.currencyPerPoint} USD per point
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl">Subtotal:</span>
                <span className="text-lg">${Number(promotionPreview?.subtotal ?? cartTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Discount:</span>
                <span>-${Number(promotionPreview?.discountAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <span>Estimated points earned:</span>
                <span>{promotionPreview?.earnedPoints ?? 0}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl">Total:</span>
                <span className="text-2xl">${Number(finalTotal).toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                disabled={checkoutLoading}
                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Processing...' : 'Checkout with Stripe'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function OrdersView({ orders, customerEmail }: any) {
  const customerOrders = orders.filter((o: any) =>
    (o.customerEmail && o.customerEmail === customerEmail) ||
    (o.customer && o.customer === customerEmail)
  );

  const getItems = (order: any) => {
    if (order.items && Array.isArray(order.items)) return order.items;
    if (order.itemsJson && order.itemsJson !== '[]') {
      try { return JSON.parse(order.itemsJson); } catch { return []; }
    }
    return [];
  };

  const getOrderId = (o: any) => o.id || o.orderId || '?';
  const getDate = (o: any) => o.date || o.createdAt || '';
  const getStatus = (o: any) => o.status || o.orderStatus || '?';
  const getTotal = (o: any) => {
    const val = o.total ?? o.grandTotal ?? 0;
    return typeof val === 'number' ? val.toFixed(2) : parseFloat(val).toFixed(2);
  };

  return (
    <div>
      <h2 className="text-xl mb-4">My Orders</h2>
      {customerOrders.length === 0 ? (
        <p className="text-gray-500">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order: any) => (
            <div key={getOrderId(order)} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between mb-2">
                <span>Order #{getOrderId(order)}</span>
                <span className="text-sm text-gray-600">{getDate(order)}</span>
              </div>
              <div className="mb-2">
                {getItems(order).map((item: any, idx: number) => (
                  <div key={idx} className="text-sm">
                    {item.name || item.productName} x {item.quantity}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span>Status: {getStatus(order)}</span>
                <span className="text-lg">${getTotal(order)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyReviewsView({ navigate }: { navigate: (path: string) => void }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await reviewsApi.getMyReviews();
        setReviews(data);
      } catch (err) {
        console.error('Failed to load my reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-gray-500">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Reviews</h2>
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <span className="text-5xl block mb-3">📝</span>
          <p className="text-gray-500 mb-2">You haven't written any reviews yet</p>
          <p className="text-sm text-gray-400 mb-4">Share your thoughts on products you've purchased</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <button
                  onClick={() => navigate(`/product/${review.productId}`)}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline text-left"
                >
                  {review.productName}
                </button>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <StarRating rating={review.rating} size="sm" />
              {review.comment && (
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
