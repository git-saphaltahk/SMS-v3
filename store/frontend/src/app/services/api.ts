import { API_BASE_URL, fetchWithAuth, authService } from './auth';
const API_URL = (import.meta.env.VITE_API_BASE_URL|| API_BASE_URL).replace(/\/$/, ''); // Remove trailing slash if present

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: string;
  message: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageName?: string;
  imageUrl?: string;
}

export interface Order {
  id: number;
  customerEmail: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  itemsJson: string;
}

export interface PromotionCoupon {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderSubtotal: number;
  maxDiscountAmount: number;
  active: boolean;
}

export interface LoyaltyRule {
  id: number;
  name: string;
  description: string;
  pointsPerDollar: number;
  currencyPerPoint: number;
  maxPointsPerOrder: number;
  active: boolean;
}

export interface PromotionPreview {
  appliedCouponCode?: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  grandTotal: number;
  earnedPoints: number;
  redeemablePoints: number;
  loyaltyRuleName: string;
  couponApplied: boolean;
}

export interface CustomerPromotionSummary {
  coupons: PromotionCoupon[];
  loyaltyRules: LoyaltyRule[];
  preview: PromotionPreview;
}

// Auth API
export const authApi = {
  register: async (email: string, password: string, role: string = 'CUSTOMER') => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
};

export const getProductImageUrl = (product: Pick<Product, 'imageName'> | null | undefined) => {
  if (!product?.imageName) return `${API_URL}/images/mystore.jpg`;
  return `${API_URL}/images/${product.imageName}`;
};

// Products API
export const productsApi = {
  getAll: async () => {
    const resp = await fetchWithAuth(`${API_URL}/api/products`);
    if (!resp.ok) throw new Error('Failed to fetch products');
    const data = await resp.json();
    // map backend product -> frontend expected fields
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      stock: p.stockQuantity ?? 0,
      imageName: p.imageName || '',
      imageUrl: getProductImageUrl({ imageName: p.imageName || '' }),
      active: p.active,
    }));
  },

  getById: async (id: number) => {
    // Use regular fetch so non-logged-in users can view product details
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = authService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const resp = await fetch(`${API_URL}/api/products/${id}`, { headers });
    if (!resp.ok) throw new Error('Failed to fetch product');
    const p = await resp.json();
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      stock: p.stockQuantity ?? 0,
      imageName: p.imageName || '',
      imageUrl: getProductImageUrl({ imageName: p.imageName || '' }),
      active: p.active,
    };
  },

  create: async (product: Omit<Product, 'id'>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/products`, {
      method: 'POST',
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageName: product.imageName,
      }),
    });
    if (!resp.ok) throw new Error('Failed to create product');
    const p = await resp.json();
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      stock: p.stockQuantity ?? 0,
      imageName: p.imageName || '',
      imageUrl: getProductImageUrl({ imageName: p.imageName || '' }),
      active: p.active,
    };
  },

  update: async (id: number, product: Omit<Product, 'id'>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageName: product.imageName,
      }),
    });
    if (!resp.ok) throw new Error('Failed to update product');
    const p = await resp.json();
    return {
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      stock: p.stockQuantity ?? 0,
      imageName: p.imageName || '',
      imageUrl: getProductImageUrl({ imageName: p.imageName || '' }),
      active: p.active,
    };
  },

  delete: async (id: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Failed to delete product');
    return resp.text();
  },

  search: async (query: string, category?: string) => {
    const url = new URL(`${API_URL}/api/products`);
    url.searchParams.append('search', query);
    if (category) url.searchParams.append('category', category);
    const resp = await fetchWithAuth(url.toString());
    if (!resp.ok) throw new Error('Failed to search products');
    const data = await resp.json();
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      category: p.category || '',
      stock: p.stockQuantity ?? 0,
      imageName: p.imageName || '',
      imageUrl: getProductImageUrl({ imageName: p.imageName || '' }),
      active: p.active,
    }));
  },
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    const resp = await fetchWithAuth(`${API_URL}/api/orders`);
    if (!resp.ok) throw new Error('Failed to fetch orders');
    return resp.json();
  },

  getById: async (id: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/orders/${id}`);
    if (!resp.ok) throw new Error('Failed to fetch order');
    return resp.json();
  },

  create: async (order: any) => {
    // if staff/pos sale -> use /api/products/pos-checkout, if customer order -> /api/customer/orders
    if (order.staffMember) {
      // map items
      const items = (order.items || []).map((it: any) => ({ productId: it.id, quantity: it.quantity }));
      const resp = await fetchWithAuth(`${API_URL}/api/products/pos-checkout`, {
        method: 'POST',
        body: JSON.stringify({ items, discountPercent: order.discountPercent || 0, customerEmail: order.customerEmail || order.customer || null }),
      });
      if (!resp.ok) throw new Error('Failed to create POS order');
      return resp.json();
    } else {
      const items = (order.items || []).map((it: any) => ({ productId: it.id, quantity: it.quantity }));
      const resp = await fetchWithAuth(`${API_URL}/api/customer/orders`, {
        method: 'POST',
        body: JSON.stringify({
          items,
          couponCode: order.couponCode || undefined,
          redeemPoints: order.redeemPoints || 0,
        }),
      });
      if (!resp.ok) throw new Error('Failed to create customer order');
      return resp.json();
    }
  },

  update: async (id: number, order: Omit<Order, 'id'>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
    if (!resp.ok) throw new Error('Failed to update order');
    return resp.json();
  },
};

// Users API (Admin)
export const usersApi = {
  getAll: async () => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/users`);
    if (!resp.ok) throw new Error('Failed to fetch users');
    const data = await resp.json();
    return data.map((u: any) => ({
      id: u.id,
      name: u.email,
      email: u.email,
      role: String(u.role).toLowerCase(),
    }));
  },

  delete: async (id: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Failed to delete user');
    return resp.text();
  },
};

export const promotionsApi = {
  getCustomerSummary: async (): Promise<CustomerPromotionSummary> => {
    const resp = await fetchWithAuth(`${API_URL}/api/customer/promotions`);
    if (!resp.ok) throw new Error('Failed to fetch promotion summary');
    return resp.json();
  },

  preview: async (body: { items: { productId: number; quantity: number }[]; couponCode?: string; redeemPoints?: number }): Promise<PromotionPreview> => {
    const resp = await fetchWithAuth(`${API_URL}/api/customer/promotions/preview`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error('Failed to preview promotion');
    return resp.json();
  },

  getCoupons: async (): Promise<PromotionCoupon[]> => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/coupons`);
    if (!resp.ok) throw new Error('Failed to fetch coupons');
    return resp.json();
  },

  getLoyaltyRules: async (): Promise<LoyaltyRule[]> => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/loyalty-rules`);
    if (!resp.ok) throw new Error('Failed to fetch loyalty rules');
    return resp.json();
  },

  createCoupon: async (coupon: Partial<PromotionCoupon>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/coupons`, {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
    if (!resp.ok) throw new Error('Failed to create coupon');
    return resp.json();
  },

  updateCoupon: async (id: number, coupon: Partial<PromotionCoupon>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon),
    });
    if (!resp.ok) throw new Error('Failed to update coupon');
    return resp.json();
  },

  deleteCoupon: async (id: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/coupons/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Failed to delete coupon');
    return resp.text();
  },

  createLoyaltyRule: async (rule: Partial<LoyaltyRule>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/loyalty-rules`, {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    if (!resp.ok) throw new Error('Failed to create loyalty rule');
    return resp.json();
  },

  updateLoyaltyRule: async (id: number, rule: Partial<LoyaltyRule>) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/loyalty-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    });
    if (!resp.ok) throw new Error('Failed to update loyalty rule');
    return resp.json();
  },

  deleteLoyaltyRule: async (id: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/admin/promotions/loyalty-rules/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Failed to delete loyalty rule');
    return resp.text();
  },
};

// Payments API
// ====== Recommendation & Review Types ======

export interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageName?: string;
  averageRating: number;
  reviewCount: number;
  recommendationTag: string;
}

export interface ReviewData {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RecommendationResponse {
  trending: RecommendedProduct[];
  topRated: RecommendedProduct[];
  forYou: RecommendedProduct[];
  latestReviews: ReviewData[];
}

// ====== Recommendations API ======

export const recommendationsApi = {
  getAll: async (): Promise<RecommendationResponse> => {
    const resp = await fetch(`${API_URL}/api/recommendations`);
    if (!resp.ok) throw new Error('Failed to fetch recommendations');
    return resp.json();
  },

  getTrending: async (): Promise<RecommendedProduct[]> => {
    const resp = await fetch(`${API_URL}/api/recommendations/trending`);
    if (!resp.ok) throw new Error('Failed to fetch trending');
    return resp.json();
  },

  getTopRated: async (): Promise<RecommendedProduct[]> => {
    const resp = await fetch(`${API_URL}/api/recommendations/top-rated`);
    if (!resp.ok) throw new Error('Failed to fetch top rated');
    return resp.json();
  },

  getForYou: async (): Promise<RecommendedProduct[]> => {
    const resp = await fetchWithAuth(`${API_URL}/api/recommendations/for-you`);
    if (!resp.ok) throw new Error('Failed to fetch for you');
    return resp.json();
  },
};

// ====== Reviews API ======

export const reviewsApi = {
  getByProduct: async (productId: number): Promise<ReviewData[]> => {
    const resp = await fetch(`${API_URL}/api/reviews/product/${productId}`);
    if (!resp.ok) throw new Error('Failed to fetch reviews');
    return resp.json();
  },

  getStats: async (productId: number): Promise<{ averageRating: number; reviewCount: number }> => {
    const resp = await fetch(`${API_URL}/api/reviews/product/${productId}/stats`);
    if (!resp.ok) throw new Error('Failed to fetch review stats');
    return resp.json();
  },

  create: async (productId: number, rating: number, comment: string): Promise<ReviewData> => {
    const resp = await fetchWithAuth(`${API_URL}/api/reviews`, {
      method: 'POST',
      body: JSON.stringify({ productId, rating, comment }),
    });
    if (!resp.ok) throw new Error('Failed to create review');
    return resp.json();
  },

  getLatest: async (): Promise<ReviewData[]> => {
    const resp = await fetch(`${API_URL}/api/reviews/latest`);
    if (!resp.ok) throw new Error('Failed to fetch latest reviews');
    return resp.json();
  },

  getMyReviews: async (): Promise<ReviewData[]> => {
    const resp = await fetchWithAuth(`${API_URL}/api/reviews/my`);
    if (!resp.ok) throw new Error('Failed to fetch my reviews');
    return resp.json();
  },
};

export const paymentsApi = {
  create: async (orderId: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/payments`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    if (!resp.ok) throw new Error('Failed to create payment');
    return resp.json();
  },

  initiateCheckout: async (paymentId: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/payments/${paymentId}/initiate`, {
      method: 'POST',
    });
    if (!resp.ok) throw new Error('Failed to initiate payment');
    return resp.json();
  },

  getStatus: async (paymentId: number) => {
    const resp = await fetchWithAuth(`${API_URL}/api/payments/${paymentId}`);
    if (!resp.ok) throw new Error('Failed to fetch payment status');
    return resp.json();
  },
};
