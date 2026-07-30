import { create } from "zustand";
import { ActiveView } from "@/types";

interface VaultState {
  activeProjectId: number | null;
  setActiveProjectId: (id: number | null) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isZenMode: boolean;
  toggleZenMode: () => void;
  setZenMode: (val: boolean) => void;
  isCharacterDrawerOpen: boolean;
  setCharacterDrawerOpen: (open: boolean) => void;
  selectedChapterId: number | null;
  setSelectedChapterId: (id: number | null) => void;
  soundscape: "off" | "rain" | "library" | "fireplace";
  setSoundscape: (val: "off" | "rain" | "library" | "fireplace") => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id, selectedChapterId: null }),
  activeView: "dashboard",
  setActiveView: (view) => set({ activeView: view }),
  isZenMode: false,
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  setZenMode: (val) => set({ isZenMode: val }),
  isCharacterDrawerOpen: false,
  setCharacterDrawerOpen: (open) => set({ isCharacterDrawerOpen: open }),
  selectedChapterId: null,
  setSelectedChapterId: (id) => set({ selectedChapterId: id }),
  soundscape: "off",
  setSoundscape: (val) => set({ soundscape: val }),
}));
