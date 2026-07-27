import { useNavigate } from 'react-router-dom';

export interface LandingPageProps {
  onNavigate: (view: "customer" | "staff") => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Family Store</h1>
            <p className="text-sm text-gray-600">Your premium destination for Men, Women & Kids fashion</p>
          </div>
          <nav className="flex gap-4 flex-wrap">
            <button
              onClick={() => onNavigate("customer")}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition font-medium"
            >
              Customer Login
            </button>
            <button
              onClick={() => navigate('/register/customer')}
              className="px-4 py-2 text-green-600 hover:bg-green-50 rounded transition font-medium"
            >
              Customer Register
            </button>
            <button
              onClick={() => onNavigate("staff")}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded transition font-medium"
            >
              Staff Portal
            </button>
            <button
              onClick={() => navigate('/register/staff')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition font-medium"
            >
              Staff Register
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 text-gray-800">Welcome to Family Store</h2>
            <p className="text-xl mb-8 text-gray-600">
              Premium clothing for the entire family. Shop our exclusive collections for Men, Women, and Kids.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => onNavigate("customer")}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Shop Now
              </button>
              <button
                onClick={() => navigate('/register/customer')}
                className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
              >
                Create Account
              </button>
              <button
                onClick={() => onNavigate("staff")}
                className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 transition font-semibold text-lg"
              >
                Staff Portal
              </button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-center">Shop by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center cursor-pointer" onClick={() => onNavigate("customer")}>
              <div className="text-6xl mb-4">👨</div>
              <h4 className="text-2xl font-semibold mb-2">Men</h4>
              <p className="text-gray-600 mb-4">Premium shirts, jeans, jackets & shoes</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Shop Men →</button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center cursor-pointer" onClick={() => onNavigate("customer")}>
              <div className="text-6xl mb-4">👩</div>
              <h4 className="text-2xl font-semibold mb-2">Women</h4>
              <p className="text-gray-600 mb-4">Dresses, blouses, skirts & heels</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Shop Women →</button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center cursor-pointer" onClick={() => onNavigate("customer")}>
              <div className="text-6xl mb-4">👧</div>
              <h4 className="text-2xl font-semibold mb-2">Kids</h4>
              <p className="text-gray-600 mb-4">T-shirts, shorts, dresses & sneakers</p>
              <button className="text-blue-600 font-semibold hover:text-blue-700">Shop Kids →</button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Why Choose Family Store?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✨</div>
              <h5 className="font-semibold mb-2">Premium Quality</h5>
              <p className="text-gray-600 text-sm">High-quality fabrics & design</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h5 className="font-semibold mb-2">Best Prices</h5>
              <p className="text-gray-600 text-sm">Competitive pricing for all</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h5 className="font-semibold mb-2">Fast Shipping</h5>
              <p className="text-gray-600 text-sm">Quick delivery nationwide</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h5 className="font-semibold mb-2">Secure Checkout</h5>
              <p className="text-gray-600 text-sm">Safe payment methods</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Shop?</h3>
          <p className="text-lg mb-6 text-blue-100">Browse our latest collections and find your perfect fit</p>
          <button
            onClick={() => onNavigate("customer")}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Start Shopping
          </button>
        </section>
      </main>

      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm">
          <p>&copy; 2024 Family Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
