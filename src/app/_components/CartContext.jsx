"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setCartItems(data.items || []);
        setCartTotal(data.total || 0);
        setCartCount(data.count || 0);
      }
    } catch (err) {
      console.error("[CartContext] fetchCart error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // Re-fetch cart whenever auth status changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (courseId, courseTitle) => {
    if (status !== "authenticated") {
      toast.error("Please log in to add items to your cart");
      return false;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        toast("Already in your cart!", { icon: "🛒" });
        return true;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add to cart");
      }

      toast.success(`"${courseTitle}" added to cart!`);
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.message || "Could not add to cart");
      return false;
    }
  };

  const removeFromCart = async (courseId) => {
    try {
      const res = await fetch(`/api/cart/${courseId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove item");
      }
      await fetchCart();
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error(err.message || "Could not remove item");
    }
  };

  const clearCart = async () => {
    try {
      await fetch("/api/cart", { method: "DELETE" });
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    } catch (err) {
      console.error("[CartContext] clearCart error:", err);
    }
  };

  const isInCart = (courseId) =>
    cartItems.some((item) => item.course_id === courseId);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        isLoading,
        addToCart,
        removeFromCart,
        clearCart,
        fetchCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
