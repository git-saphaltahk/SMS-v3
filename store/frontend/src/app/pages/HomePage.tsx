import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductRecommendationCard from '../components/ProductRecommendationCard';
import ReviewCard from '../components/ReviewCard';
import { recommendationsApi, type RecommendedProduct, type ReviewData } from '../services/api';
import { authService } from '../services/auth';

// ====== Fallback demo data when backend is unavailable ======
const DEMO_PRODUCTS: RecommendedProduct[] = [
  { id: 1, name: 'Classic T-Shirt', price: 19.99, category: 'Men', stockQuantity: 50, imageName: 'tshirt.jpg', averageRating: 4.5, reviewCount: 4, recommendationTag: '🔥 Trending' },
  { id: 2, name: 'Slim Fit Jeans', price: 49.99, category: 'Men', stockQuantity: 30, imageName: 'jeans.jpg', averageRating: 4.0, reviewCount: 3, recommendationTag: '⭐ Top Rated' },
  { id: 3, name: 'Summer Dress', price: 39.99, category: 'Women', stockQuantity: 25, imageName: 'summerdress.jpg', averageRating: 4.8, reviewCount: 4, recommendationTag: '💡 For You' },
  { id: 4, name: 'Leather Handbag', price: 59.99, category: 'Women', stockQuantity: 15, imageName: 'handbag.jpg', averageRating: 0, reviewCount: 0, recommendationTag: '🔥 Trending' },
  { id: 5, name: 'Running Sneakers', price: 29.99, category: 'Kids', stockQuantity: 40, imageName: 'sneaker.jpg', averageRating: 4.3, reviewCount: 3, recommendationTag: '⭐ Top Rated' },
  { id: 6, name: 'Cartoon Backpack', price: 24.99, category: 'Kids', stockQuantity: 35, imageName: 'backpack.jpg', averageRating: 0, reviewCount: 0, recommendationTag: '💡 For You' },
];

const DEMO_REVIEWS: ReviewData[] = [
  { id: 1, productId: 1, productName: 'Classic T-Shirt', userId: 1, userName: 'customer@example.com', rating: 5, comment: 'Excellent quality! Soft fabric, comfortable fit. Highly recommend!', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 2, productId: 1, productName: 'Classic T-Shirt', userId: 2, userName: 'admin@store.com', rating: 4, comment: 'Nice t-shirt, true color, great value for money.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 3, productId: 2, productName: 'Slim Fit Jeans', userId: 1, userName: 'customer@example.com', rating: 4, comment: 'Great fit — slim but not tight. Very comfortable.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 4, productId: 3, productName: 'Summer Dress', userId: 3, userName: 'manager@store.com', rating: 5, comment: 'Absolutely gorgeous dress! Light fabric perfect for summer.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, productId: 5, productName: 'Running Sneakers', userId: 1, userName: 'customer@example.com', rating: 5, comment: 'Very lightweight for running, great cushioning!', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 6, productId: 3, productName: 'Summer Dress', userId: 2, userName: 'admin@store.com', rating: 5, comment: 'Bought as a gift — she absolutely loves it! Great craftsmanship.', createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<RecommendedProduct[]>([]);
  const [topRated, setTopRated] = useState<RecommendedProduct[]>([]);
  const [forYou, setForYou] = useState<RecommendedProduct[]>([]);
  const [latestReviews, setLatestReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const isLoggedIn = authService.isAuthenticated();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationsApi.getAll();
      if (data && (data.trending?.length || data.topRated?.length)) {
        setTrending(data.trending || []);
        setTopRated(data.topRated || []);
        setForYou(data.forYou || []);
        setLatestReviews(data.latestReviews || []);
        setUsingFallback(false);
      } else {
        useFallbackData();
      }
    } catch (error) {
      console.error('Failed to load recommendations, using fallback data:', error);
      useFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackData = () => {
    // Shuffle demo products into three groups for visual variety
    const shuffled = [...DEMO_PRODUCTS].sort(() => Math.random() - 0.5);
    setTrending(shuffled.slice(0, 4).map(p => ({ ...p, recommendationTag: '🔥 Trending' })));
    setTopRated(shuffled.slice(1, 5).map(p => ({ ...p, recommendationTag: '⭐ Top Rated' })));
    setForYou(shuffled.slice(2, 6).map(p => ({ ...p, recommendationTag: '💡 For You' })));
    setLatestReviews(DEMO_REVIEWS);
    setUsingFallback(true);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAllReviews = (productId: number) => {
    navigate(`/product/${productId}?tab=reviews`);
  };

  const stats = [
    { label: 'Products', value: '100+', icon: '🛍️' },
    { label: 'Happy Customers', value: '10,000+', icon: '👥' },
    { label: 'Satisfaction', value: '98%', icon: '⭐' },
    { label: 'AI Accuracy', value: '95%', icon: '🤖' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header navigate={navigate} isLoggedIn={isLoggedIn} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">AI engine is analyzing products for you...</p>
            <p className="text-gray-400 text-sm mt-1">Scanning reviews & trends</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header navigate={navigate} isLoggedIn={isLoggedIn} />

      <main>
        {/* ======== Hero Banner ======== */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <span className="text-2xl">🤖</span>
                <span className="text-sm font-medium">AI Recommendation Engine v2.0</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                AI-Powered Shopping
                <span className="block text-3xl md:text-4xl mt-2 font-light text-blue-100">
                  Discover products you'll love
                </span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Browse products, read reviews, and find the perfect items.
                Our AI recommends what you'll love based on real ratings.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigate(isLoggedIn ? '/customer' : '/login/customer')}
                  className="bg-white text-blue-700 px-8 py-4 rounded-xl hover:bg-gray-100 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🛒 Start Shopping
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('top-rated-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition font-semibold text-lg"
                >
                  ⭐ Browse Top Rated
                </button>
                {!isLoggedIn && (
                  <button
                    onClick={() => navigate('/register/customer')}
                    className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition font-medium text-lg"
                  >
                    ✨ Sign Up Free
                  </button>
                )}
              </div>

              {usingFallback && (
                <p className="text-xs text-blue-200 mt-4 bg-white/10 inline-block px-3 py-1 rounded-full">
                  📡 Demo Mode — start the backend for live AI recommendations
                </p>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
            </svg>
          </div>
        </section>

        {/* ======== Stats Bar ======== */}
        <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl shadow-md p-5 text-center hover:shadow-lg transition-shadow">
                <span className="text-3xl">{stat.icon}</span>
                <div className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ======== For You Section ======== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader
            icon="💡"
            title="For You"
            subtitle="Personalized picks based on your preferences"
            badge="AI Personalized"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {forYou.map((product) => (
              <ProductRecommendationCard
                key={`fy-${product.id}`}
                {...product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ======== Trending Section ======== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader
            icon="🔥"
            title="Trending Now"
            subtitle="What everyone's buying right now"
            badge="Real-time Hot"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trending.map((product) => (
              <ProductRecommendationCard
                key={`tr-${product.id}`}
                {...product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ======== Top Rated Section ======== */}
        <section id="top-rated-section" className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader
            icon="⭐"
            title="Top Rated"
            subtitle="Highest rated by our community"
            badge="Customer Favorites"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topRated.map((product) => (
              <ProductRecommendationCard
                key={`trp-${product.id}`}
                {...product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </section>

        {/* ======== Latest Reviews ======== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader
            icon="💬"
            title="Latest Reviews"
            subtitle="Real feedback from real customers"
            badge="Verified Reviews"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestReviews.slice(0, 6).map((review) => (
              <ReviewCard
                key={review.id}
                userName={review.userName}
                rating={review.rating}
                comment={review.comment}
                productName={review.productName}
                createdAt={review.createdAt}
                onProductClick={() => handleProductClick(review.productId)}
              />
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400 mb-2">
              👆 Click any product or review to see details and write your own review
            </p>
          </div>
        </section>

        {/* ======== AI Feature Highlight ======== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-10 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">🤖 How Does Our AI Work?</h2>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Powered by collaborative filtering and content-based algorithms, our AI analyzes
              millions of data points to deliver spot-on recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold mb-2">Data Analysis</h3>
                <p className="text-sm text-indigo-200">Analyzes user preferences, browsing history & purchase patterns</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-4xl mb-3">🧠</div>
                <h3 className="font-semibold mb-2">Smart Matching</h3>
                <p className="text-sm text-indigo-200">Collaborative filtering + content-based recommendation engine</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-semibold mb-2">Personalized Picks</h3>
                <p className="text-sm text-indigo-200">Real-time personalized recommendations, continuously optimized</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ======== Footer ======== */}
      <footer className="bg-gray-900 text-gray-400 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">Family Store</h3>
              <p className="text-sm">AI-powered smart shopping platform</p>
              <p className="text-sm mt-2">Every purchase, precisely matched</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/login/customer')} className="hover:text-white transition">Customer Login</button></li>
                <li><button onClick={() => navigate('/register/customer')} className="hover:text-white transition">Create Account</button></li>
                <li><button onClick={() => navigate('/login/staff')} className="hover:text-white transition">Staff Portal</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white transition cursor-pointer">👨 Men</li>
                <li className="hover:text-white transition cursor-pointer">👩 Women</li>
                <li className="hover:text-white transition cursor-pointer">👧 Kids</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">About</h4>
              <p className="text-sm">CSIT321 Capstone Project</p>
              <p className="text-sm">University of Wollongong</p>
              <p className="text-sm">Find us at: (demo email) familystore@example.com</p>
              <p className="text-sm mt-2">© 2026 Family Store</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ====== Sub-components ======

function Header({ navigate, isLoggedIn }: { navigate: (path: string) => void; isLoggedIn: boolean }) {
  const handleLogout = () => {
    authService.clearToken();
    window.location.href = '/';
  };

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

        <nav className="flex items-center gap-3 flex-wrap">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => navigate('/customer')}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
              >
                My Store
              </button>
              <button
                onClick={handleLogout}
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
                Customer Login
              </button>
              <button
                onClick={() => navigate('/register/customer')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => navigate('/login/staff')}
                className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Staff Portal
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <span className="px-2.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full">
            {badge}
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
