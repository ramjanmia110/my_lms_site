import { create } from 'zustand'

interface OnlineState {
  onlineUserIds: Set<number>
  setOnline: (ids: number[]) => void
  addOnline: (id: number) => void
  removeOnline: (id: number) => void
  isOnline: (id: number) => boolean
}

export const useOnlineStore = create<OnlineState>((set, get) => ({
  onlineUserIds: new Set<number>(),
  setOnline: (ids) => set({ onlineUserIds: new Set(ids) }),
  addOnline: (id) => set((s) => { const n = new Set(s.onlineUserIds); n.add(id); return { onlineUserIds: n } }),
  removeOnline: (id) => set((s) => { const n = new Set(s.onlineUserIds); n.delete(id); return { onlineUserIds: n } }),
  isOnline: (id) => get().onlineUserIds.has(id),
}))
