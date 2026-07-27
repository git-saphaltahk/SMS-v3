import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import LandingPage from './LandingPage';

export interface LoginPageProps {
  onLoginSuccess: (type: string, userName: string, userEmail: string) => void;
  authError: string | null;
}

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <LandingPage
      onNavigate={(view) =>
        navigate(view === 'customer' ? '/login/customer' : '/login/staff')
      }
    />
  );
}

export function CustomerLoginPage({ onLoginSuccess, authError }: LoginPageProps) {
  const navigate = useNavigate();

  return (
    <CustomerLoginForm
      onLogin={onLoginSuccess}
      onBack={() => navigate('/')}
      onForgotPassword={() => navigate('/forgot-password')}
      onRegister={() => navigate('/register/customer')}
      authError={authError}
    />
  );
}

export function StaffAdminManagerLoginPage({ onLoginSuccess, authError }: LoginPageProps) {
  const navigate = useNavigate();

  return (
    <StaffAdminManagerLoginForm
      onLogin={onLoginSuccess}
      onBack={() => navigate('/')}
      onForgotPassword={() => navigate('/forgot-password')}
      onRegister={() => navigate('/register/staff')}
      authError={authError}
    />
  );
}

interface LoginFormProps {
  onLogin: (type: string, userName: string, userEmail: string) => void;
  onBack: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  authError: string | null;
}

function AuthPageLayout({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button onClick={onBack} className="text-blue-600 hover:underline mr-4">
            Back to Home
          </button>
          <h1 className="text-xl font-semibold">Family Store</h1>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
          {children}
        </div>
      </main>
    </div>
  );
}

function CustomerLoginForm({ onLogin, onBack, onForgotPassword, onRegister, authError }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      onLogin(response.role || 'customer', response.name, response.email);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Customer Login" onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error ? (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New to Family Store?</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegister}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Create Account
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs">Email: customer@example.com</p>
          <p className="text-xs">Password: password123</p>
        </div>
      </form>
    </AuthPageLayout>
  );
}

function StaffAdminManagerLoginForm({ onLogin, onBack, onForgotPassword, onRegister, authError }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      onLogin(response.role, response.name, response.email);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout title="Staff / Admin / Manager Login" onBack={onBack}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Quick Select Role</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              type="button"
              onClick={() => { setEmail('staff@store.com'); setPassword('password123'); }}
              className={`px-3 py-2 rounded text-xs font-medium border transition ${
                email === 'staff@store.com' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Cashier
            </button>
            <button
              type="button"
              onClick={() => { setEmail('manager@store.com'); setPassword('password123'); }}
              className={`px-3 py-2 rounded text-xs font-medium border transition ${
                email === 'manager@store.com' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => { setEmail('admin@store.com'); setPassword('password123'); }}
              className={`px-3 py-2 rounded text-xs font-medium border transition ${
                email === 'admin@store.com' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {error ? (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition font-medium"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">New staff member?</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegister}
          className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Create Staff Account
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs">Email: staff@store.com</p>
          <p className="text-xs">Password: password123</p>
          <p className="text-xs">Role: Cashier</p>
        </div>
      </form>
    </AuthPageLayout>
  );
}
