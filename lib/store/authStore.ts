import { create } from "zustand";

interface User {
  id: number;
  email: string;
  nom: string;
  role: string;
  company: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      set({
        accessToken: token,
        refreshToken: refresh,
        user: JSON.parse(userStr),
        isAuthenticated: true,
      });
    }
  },
}));