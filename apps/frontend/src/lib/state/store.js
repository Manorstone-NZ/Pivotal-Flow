import { create } from 'zustand';
export const useAppStore = create((set) => ({
    count: 0,
    inc: () => set((s) => ({ count: s.count + 1 }))
}));
//# sourceMappingURL=store.js.map