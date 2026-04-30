import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthState } from "@/types/auth-types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      roles: [],

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          roles: user.roles || [],
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          roles: [],
        });
      },

      setToken: (token: string) => {
        set({ token });
      },

      updateUser: (user: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null,
          roles: user.roles ? user.roles : state.roles,
        }));
      },
    }),
    {
      name: "adminix-auth",
    }
  )
);
