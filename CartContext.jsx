import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const EMPTY = { items: [], count: 0, itemsPrice: 0 };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return setCart(EMPTY);
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch {
      setCart(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    setCart(data);
  };
  const setQty = async (productId, quantity) => {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    setCart(data);
  };
  const remove = async (productId) => {
    const { data } = await api.delete(`/cart/items/${productId}`);
    setCart(data);
  };
  const clear = () => setCart(EMPTY);

  return (
    <CartContext.Provider value={{ cart, loading, add, setQty, remove, clear, refresh }}>{children}</CartContext.Provider>
  );
}
