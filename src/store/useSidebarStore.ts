import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  setOpen: (value: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (value) => set({ isOpen: value }),
}))
