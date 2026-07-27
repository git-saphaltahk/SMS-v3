import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface AuthLayoutProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

function AuthLayout({ title, onBack, children }: AuthLayoutProps) {
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

// Registration Pages

interface RegisterFormProps {
  onRegisterSuccess: (role: string, name: string, email: string) => void;
  onBack: () => void;
}

export function CustomerRegisterPage({
  onRegisterSuccess,
  onBack,
}: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) return 'Email is required';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(email, password, 'CUSTOMER');
      authService.setToken(response.accessToken);
      onRegisterSuccess('customer', email, email);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Customer Registration" onBack={onBack}>
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
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Re-enter your password"
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-green-500 text-xs mt-1">Passwords match ✓</p>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login/customer')}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export function StaffRegisterPage({
  onRegisterSuccess,
  onBack,
}: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) return 'Email is required';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (!role) return 'Role is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(email, password, role);
      authService.setToken(response.accessToken);
      const roleDisplay = role === 'CASHIER' ? 'staff' : role.toLowerCase();
      onRegisterSuccess(roleDisplay, email, email);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Staff / Admin / Manager Registration" onBack={onBack}>
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
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="CASHIER">Staff / Cashier</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="At least 6 characters"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Re-enter your password"
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p className="text-green-500 text-xs mt-1">Passwords match ✓</p>
          )}
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition font-medium"
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login/staff')}
              className="text-blue-600 hover:underline font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
