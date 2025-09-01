import { createContext, useContext, useEffect, useState } from "react";
import { getCart } from "../services/cartServices";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });

  useEffect(() => {
    const fetchCart = async () => {
      const res = await getCart();
      console.log("Cart fetched:", res);
      const cartItems = Array.isArray(res?.data) ? res.data : [];
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCart({ items: cartItems, total });
    };
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}
