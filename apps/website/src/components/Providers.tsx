"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Cart, User } from "@template/api";
import { api, getToken, setToken } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface CartContextValue {
  cart: Cart;
  loading: boolean;
  add: (productId: string, quantity?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const EMPTY_CART: Cart = { items: [], subtotal: 0 };

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [cartLoading, setCartLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const refreshAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }
    try {
      const me = await api<User>("/auth/me");
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!getToken()) {
      setCart(EMPTY_CART);
      return;
    }
    setCartLoading(true);
    try {
      const data = await api<Cart>("/cart");
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth().then(refreshCart);
  }, [refreshAuth, refreshCart]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === "shopora.cart.updated") refreshCart();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshCart]);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(data.token);
      setUser(data.user);
      await refreshCart();
      showToast(`Welcome back, ${data.user.name.split(" ")[0]}`, "success");
    },
    [refreshCart, showToast],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: { name, email, password },
        auth: false,
      });
      setToken(data.token);
      setUser(data.user);
      await refreshCart();
      showToast("Account created", "success");
    },
    [refreshCart, showToast],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setCart(EMPTY_CART);
    showToast("Signed out", "info");
  }, [showToast]);

  const cartAdd = useCallback(
    async (productId: string, quantity = 1) => {
      if (!getToken()) {
        showToast("Sign in to add items to cart", "info");
        throw new Error("auth_required");
      }
      const data = await api<Cart>("/cart/add", {
        method: "POST",
        body: { productId, quantity },
      });
      setCart(data);
      showToast("Added to cart", "success");
    },
    [showToast],
  );

  const cartRemove = useCallback(async (productId: string) => {
    const data = await api<Cart>("/cart/remove", {
      method: "POST",
      body: { productId },
    });
    setCart(data);
  }, []);

  const cartClear = useCallback(async () => {
    const data = await api<Cart>("/cart/clear", { method: "POST" });
    setCart(data);
  }, []);

  const authValue = useMemo<AuthContextValue>(
    () => ({ user, loading: authLoading, login, register, logout, refresh: refreshAuth }),
    [user, authLoading, login, register, logout, refreshAuth],
  );

  const cartValue = useMemo<CartContextValue>(
    () => ({
      cart,
      loading: cartLoading,
      add: cartAdd,
      remove: cartRemove,
      clear: cartClear,
      refresh: refreshCart,
    }),
    [cart, cartLoading, cartAdd, cartRemove, cartClear, refreshCart],
  );

  const toastValue = useMemo<ToastContextValue>(() => ({ show: showToast }), [showToast]);

  return (
    <AuthContext.Provider value={authValue}>
      <CartContext.Provider value={cartValue}>
        <ToastContext.Provider value={toastValue}>
          {children}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
                  t.type === "success"
                    ? "border-emerald-500/30 bg-white text-emerald-700"
                    : t.type === "error"
                      ? "border-rose-500/30 bg-white text-rose-700"
                      : "border-white/10 bg-white text-slate-200"
                }`}
              >
                {t.message}
              </div>
            ))}
          </div>
        </ToastContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within Providers");
  return ctx;
}
