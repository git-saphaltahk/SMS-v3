export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'men' | 'women' | 'kids';
  stock: number;
}

export const PRODUCTS: Record<Product['category'], Product[]> = {
  men: [
    { id: 1, name: "Men's T-Shirt", price: 29.99, category: 'men', stock: 20 },
    { id: 2, name: "Men's Jeans", price: 59.99, category: 'men', stock: 15 },
    { id: 3, name: "Men's Jacket", price: 89.99, category: 'men', stock: 12 },
    { id: 4, name: "Men's Shoes", price: 79.99, category: 'men', stock: 18 },
  ],
  women: [
    { id: 5, name: "Women's Dress", price: 69.99, category: 'women', stock: 14 },
    { id: 6, name: "Women's Blouse", price: 39.99, category: 'women', stock: 22 },
    { id: 7, name: "Women's Skirt", price: 49.99, category: 'women', stock: 16 },
    { id: 8, name: "Women's Heels", price: 89.99, category: 'women', stock: 10 },
  ],
  kids: [
    { id: 9, name: "Kids T-Shirt", price: 19.99, category: 'kids', stock: 24 },
    { id: 10, name: "Kids Shorts", price: 24.99, category: 'kids', stock: 20 },
    { id: 11, name: "Kids Dress", price: 34.99, category: 'kids', stock: 18 },
    { id: 12, name: "Kids Sneakers", price: 44.99, category: 'kids', stock: 14 },
  ],
};

export const allProducts = [...PRODUCTS.men, ...PRODUCTS.women, ...PRODUCTS.kids];
