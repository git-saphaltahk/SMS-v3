export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
  message?: string;
}

export interface RegisterResponse {
  accessToken: string;
  userId: number;
  email: string;
  role: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    const rawRole = data.role ? String(data.role).toLowerCase() : 'customer';
    const role = rawRole === 'cashier' ? 'staff' : rawRole;

    // normalize backend auth response to frontend expected shape
    return {
      token: data.accessToken,
      type: data.tokenType || 'Bearer',
      id: data.userId,
      name: data.email,
      email: data.email,
      role,
      message: undefined,
    } as LoginResponse;
  },

  async register(
    email: string,
    password: string,
    role: string = 'CUSTOMER'
  ): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: role.toUpperCase() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      userId: data.userId,
      email: data.email,
      role: data.role,
    };
  },

  async forgotPassword(email: string): Promise<PasswordResetResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    const data = await response.json();
    return data;
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Password reset failed');
    }

    const data = await response.json();
    return data;
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = String(payload.role || '').toLowerCase();
      return role === 'cashier' ? 'staff' : role;
    } catch {
      return null;
    }
  },

  logout(): void {
    this.clearToken();
    window.location.href = '/login';
  },
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    authService.clearToken();
    window.location.href = '/login';
  }

  return response;
};

