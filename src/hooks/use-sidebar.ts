
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  collapsed: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      onExpand: () => set({ collapsed: false }),
      onCollapse: () => set({ collapsed: true }),
    }),
    {
      name: 'sidebar-state',
    }
  )
);
