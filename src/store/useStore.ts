import { create } from 'zustand';

export type PatternType = 'sphere' | 'cube' | 'spiral' | 'random' | 'ring' | 'wave';
export type GestureType = 'none' | 'open' | 'closed' | 'heart' | 'victory' | 'middle_finger';

interface AppState {
  pattern: PatternType;
  color: string;
  customName: string;
  isCameraMinimized: boolean;
  setPattern: (pattern: PatternType) => void;
  setColor: (color: string) => void;
  setCustomName: (name: string) => void;
  toggleCameraMinimized: () => void;
}

export const useStore = create<AppState>((set) => ({
  pattern: 'sphere',
  color: '#00ffff',
  customName: 'Someone Special',
  isCameraMinimized: false,
  setPattern: (pattern) => set({ pattern }),
  setColor: (color) => set({ color }),
  setCustomName: (customName) => set({ customName }),
  toggleCameraMinimized: () => set((state) => ({ isCameraMinimized: !state.isCameraMinimized })),
}));

// Mutable state for high-frequency updates (gesture)
export const gestureState = {
  value: 0, // 0 (closed) to 1 (open)
  type: 'none' as GestureType,
  rotation: { x: 0, y: 0 }, // Target rotation based on hand position
  isTracking: false,
};
