import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { reviewsApi, productsApi, getProductImageUrl, type ReviewData } from '../services/api';
import { authService } from '../services/auth';

// ====== Demo fallback data ======
const DEMO_PRODUCTS: Record<number, any> = {
  1: { id: 1, name: 'Classic T-Shirt', price: 19.99, category: 'Men', stock: 50, imageName: 'tshirt.jpg' },
  2: { id: 2, name: 'Slim Fit Jeans', price: 49.99, category: 'Men', stock: 30, imageName: 'jeans.jpg' },
  3: { id: 3, name: 'Summer Dress', price: 39.99, category: 'Women', stock: 25, imageName: '' },
  4: { id: 4, name: 'Leather Handbag', price: 59.99, category: 'Women', stock: 15, imageName: '' },
  5: { id: 5, name: 'Running Sneakers', price: 29.99, category: 'Kids', stock: 40, imageName: 'sneaker.jpg' },
  6: { id: 6, name: 'Cartoon Backpack', price: 24.99, category: 'Kids', stock: 35, imageName: '' },
};

const DEMO_REVIEWS: Record<number, ReviewData[]> = {
  1: [
    { id: 101, productId: 1, productName: 'Classic T-Shirt', userId: 1, userName: 'customer@example.com', rating: 5, comment: 'Excellent quality! Soft fabric, comfortable fit. Highly recommend!', createdAt: '2026-06-28T10:00:00Z' },
    { id: 102, productId: 1, productName: 'Classic T-Shirt', userId: 2, userName: 'admin@store.com', rating: 4, comment: 'Nice t-shirt, true color, no fade after washing. Slightly larger than expected.', createdAt: '2026-06-25T14:30:00Z' },
    { id: 103, productId: 1, productName: 'Classic T-Shirt', userId: 3, userName: 'manager@store.com', rating: 5, comment: 'Classic style, great quality fabric. My go-to t-shirt!', createdAt: '2026-06-20T08:15:00Z' },
    { id: 104, productId: 1, productName: 'Classic T-Shirt', userId: 4, userName: 'staff@store.com', rating: 4, comment: 'Great value for money. Already bought three!', createdAt: '2026-06-15T16:45:00Z' },
  ],
  2: [
    { id: 201, productId: 2, productName: 'Slim Fit Jeans', userId: 1, userName: 'customer@example.com', rating: 4, comment: 'Great fit — slim but not tight. The stretchy fabric is very comfortable.', createdAt: '2026-06-27T09:00:00Z' },
    { id: 202, productId: 2, productName: 'Slim Fit Jeans', userId: 2, userName: 'admin@store.com', rating: 5, comment: 'Best jeans I\'ve bought in years. Perfect slim fit!', createdAt: '2026-06-22T11:30:00Z' },
    { id: 203, productId: 2, productName: 'Slim Fit Jeans', userId: 3, userName: 'manager@store.com', rating: 3, comment: 'Good jeans but pockets could be deeper.', createdAt: '2026-06-18T13:00:00Z' },
  ],
  3: [
    { id: 301, productId: 3, productName: 'Summer Dress', userId: 1, userName: 'customer@example.com', rating: 5, comment: 'Absolutely gorgeous dress! Light fabric perfect for summer, looks elegant.', createdAt: '2026-06-29T15:00:00Z' },
    { id: 302, productId: 3, productName: 'Summer Dress', userId: 2, userName: 'admin@store.com', rating: 5, comment: 'Bought as a gift for my girlfriend — she absolutely loves it!', createdAt: '2026-06-26T10:00:00Z' },
    { id: 303, productId: 3, productName: 'Summer Dress', userId: 3, userName: 'manager@store.com', rating: 4, comment: 'Beautiful dress, perfect length. Would love more color options.', createdAt: '2026-06-21T12:00:00Z' },
    { id: 304, productId: 3, productName: 'Summer Dress', userId: 4, userName: 'staff@store.com', rating: 5, comment: 'Wore this to a wedding — got so many compliments!', createdAt: '2026-06-16T17:00:00Z' },
  ],
  5: [
    { id: 501, productId: 5, productName: 'Running Sneakers', userId: 1, userName: 'customer@example.com', rating: 5, comment: 'Very lightweight for running, great cushioning. Ran 5km with no foot fatigue.', createdAt: '2026-06-28T07:00:00Z' },
    { id: 502, productId: 5, productName: 'Running Sneakers', userId: 2, userName: 'admin@store.com', rating: 4, comment: 'Good sneakers for the price. Comfortable for daily runs.', createdAt: '2026-06-23T18:00:00Z' },
    { id: 503, productId: 5, productName: 'Running Sneakers', userId: 3, userName: 'manager@store.com', rating: 4, comment: 'My kid loves these sneakers! Stylish design and solid quality.', createdAt: '2026-06-19T14:00:00Z' },
  ],
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = Number(id);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isLoggedIn = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  useEffect(() => {
    // If URL has ?tab=reviews, auto-show the review section
    if (searchParams.get('tab') === 'reviews') {
      // Scroll to reviews after load
      setTimeout(() => {
        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProductDetail();
  }, [productId]);

  const loadProductDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, reviewsData, statsData] = await Promise.all([
        productsApi.getById(productId),
        reviewsApi.getByProduct(productId),
        reviewsApi.getStats(productId),
      ]);
      setProduct(productData);
      setReviews(reviewsData);
      setStats(statsData);
      setUsingFallback(false);
    } catch (err) {
      console.error('Failed to load product detail, using fallback data:', err);
      // Use fallback demo data
      const fallbackProduct = DEMO_PRODUCTS[productId];
      const fallbackReviews = DEMO_REVIEWS[productId] || [];
      if (fallbackProduct) {
        setProduct(fallbackProduct);
        setReviews(fallbackReviews);
        const avg = fallbackReviews.length > 0
          ? fallbackReviews.reduce((s, r) => s + r.rating, 0) / fallbackReviews.length
          : 0;
        setStats({ averageRating: Math.round(avg * 10) / 10, reviewCount: fallbackReviews.length });
        setUsingFallback(true);
      } else {
        setError('Failed to load product details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) {
      setSubmitError('Please write a comment.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await reviewsApi.create(productId, newRating, newComment.trim());
      setReviews((prev) => [created, ...prev]);
      setStats((prev) => ({
        averageRating: (prev.averageRating * prev.reviewCount + newRating) / (prev.reviewCount + 1),
        reviewCount: prev.reviewCount + 1,
      }));
      setNewRating(5);
      setNewComment('');
      setShowReviewForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      const msg = err?.message || 'Failed to submit review';
      setSubmitError(msg.includes('already reviewed') ? 'You have already reviewed this product.' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    const cartJson = localStorage.getItem('smsCart');
    const cart = cartJson ? JSON.parse(cartJson) : [];
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('smsCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/customer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DetailHeader navigate={navigate} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <DetailHeader navigate={navigate} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <span className="text-5xl mb-4 block">😕</span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-4">{error || 'This product does not exist.'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImageUrl(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DetailHeader navigate={navigate} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          ← Back
        </button>

        {/* ======== Product Info Card ======== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image */}
            <div className="h-64 md:h-full bg-gray-100">
              <img
                src={`http://localhost:8082/images/${product.imageName}`}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'http://localhost:8082/images/mystore.jpg';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="p-6 md:p-8 flex flex-col">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3 w-fit">
                {product.category}
              </span>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={stats.averageRating} size="md" />
                <span className="text-lg font-semibold text-yellow-500">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </span>
                <span className="text-sm text-gray-400">
                  ({stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-red-500 mb-4">
                ¥{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              {usingFallback && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg mb-3">
                  📡 Demo data — start the backend for live data
                </p>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex gap-3 flex-wrap">
                {isLoggedIn && userRole === 'customer' && (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold"
                  >
                    🛒 Add to Cart
                  </button>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setShowReviewForm(!showReviewForm);
                      if (!showReviewForm) {
                        setTimeout(() => {
                          document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 px-6 rounded-xl hover:from-yellow-500 hover:to-amber-600 transition font-semibold"
                  >
                    {showReviewForm ? '✕ Cancel' : '⭐ Write a Review'}
                  </button>
                )}
                {!isLoggedIn && (
                  <button
                    onClick={() => navigate(`/login/customer`)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition font-semibold"
                  >
                    Login to Shop & Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======== Review Form ======== */}
        {showReviewForm && (
          <div id="review-form" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Write Your Review</h2>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                ✅ Your review has been posted successfully!
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating
                rating={newRating}
                interactive
                size="lg"
                onChange={setNewRating}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={500}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{newComment.length}/500</p>
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 rounded-xl hover:from-yellow-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* ======== Reviews List ======== */}
        <div id="reviews-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Customer Reviews ({stats.reviewCount})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Average:</span>
                <StarRating rating={stats.averageRating} size="sm" />
                <span className="text-sm font-semibold text-gray-700">
                  {stats.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">📝</span>
              <p className="text-gray-500 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-400 mb-4">
                {isLoggedIn ? 'Be the first to review this product!' : 'Login to write the first review.'}
              </p>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    setShowReviewForm(true);
                    setTimeout(() => {
                      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition font-semibold"
                >
                  ⭐ Write a Review
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  userName={review.userName}
                  rating={review.rating}
                  comment={review.comment}
                  productName={review.productName}
                  createdAt={review.createdAt}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm">
          <p>© 2026 Family Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DetailHeader({ navigate }: { navigate: (path: string) => void }) {
  const isLoggedIn = authService.isAuthenticated();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Family Store</h1>
            <p className="text-xs text-gray-500">AI-Powered Shopping</p>
          </div>
        </button>

        <nav className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/customer')}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                My Store
              </button>
              <button
                onClick={() => {
                  authService.clearToken();
                  window.location.href = '/';
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login/customer')}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register/customer')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
