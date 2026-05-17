import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      favorites: [],
      toggleFavorite: (slug) => set((state) => {
        if (state.favorites.includes(slug)) {
          return { favorites: state.favorites.filter((id) => id !== slug) };
        } else {
          return { favorites: [...state.favorites, slug] };
        }
      }),
    }),
    {
      name: 'devtools-hub-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites, theme: state.theme }),
    }
  )
);

export default useAppStore;
