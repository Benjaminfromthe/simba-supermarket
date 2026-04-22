import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Branch {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  locationNote: string;
}

interface LocationState {
  activeStore: Branch | null;
  distanceDisplay: string | null;
  isAutoDetected: boolean;
  setActiveStore: (branch: Branch, distanceDisplay?: string | null, isAutoDetected?: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      activeStore: null,
      distanceDisplay: null,
      isAutoDetected: false,
      setActiveStore: (branch, distanceDisplay = null, isAutoDetected = false) => 
        set({ activeStore: branch, distanceDisplay, isAutoDetected, error: null }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'simba-location-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        activeStore: state.activeStore, 
        distanceDisplay: state.distanceDisplay,
        isAutoDetected: state.isAutoDetected 
      }), // Don't persist loading/error states
    }
  )
);
