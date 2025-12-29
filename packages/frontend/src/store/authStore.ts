import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUserResponse } from '@sexshop/shared';

interface AuthState {
  user: IUserResponse | null;
  accessToken: string | null;
  login: (user: IUserResponse, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<IUserResponse>) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Exportar también como authStore para compatibilidad con axios.ts
export const authStore = useAuthStore;
