'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RecentItemType = 'claim' | 'investigation' | 'route';

export type RecentItem = {
  id: string;
  label: string;
  href: string;
  type: RecentItemType;
  at: number;
};

export type SavedFilterView = {
  id: string;
  name: string;
  /** Serialized URLSearchParams-style map for claims filters */
  query: Record<string, string>;
  savedAt: number;
};

export type InvestigationWorkspaceTab = 'evidence' | 'timeline' | 'comments';

export type WorkspacePreferences = {
  sidebarCollapsed: boolean;
  investigationSplitPercent: number;
  investigationActiveTab: InvestigationWorkspaceTab;
  /** table id -> last known filter query string params */
  lastTableFilters: Record<string, Record<string, string>>;
};

const defaultWorkspace: WorkspacePreferences = {
  sidebarCollapsed: false,
  investigationSplitPercent: 66,
  investigationActiveTab: 'evidence',
  lastTableFilters: {}
};

const MAX_RECENT = 10;
const MAX_SAVED_VIEWS = 10;

type UiState = {
  recentItems: RecentItem[];
  savedFilterViews: SavedFilterView[];
  workspacePreferences: WorkspacePreferences;
  pushRecentItem: (item: Omit<RecentItem, 'at'>) => void;
  removeRecentItem: (id: string) => void;
  clearRecentItems: () => void;
  addSavedFilterView: (name: string, query: Record<string, string>) => void;
  removeSavedFilterView: (id: string) => void;
  setWorkspacePreferences: (partial: Partial<WorkspacePreferences>) => void;
  setLastTableFilters: (tableId: string, query: Record<string, string>) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      recentItems: [],
      savedFilterViews: [],
      workspacePreferences: defaultWorkspace,

      pushRecentItem: (item) => {
        set((state) => {
          const next: RecentItem = { ...item, at: Date.now() };
          const withoutDup = state.recentItems.filter((r) => r.href !== next.href);
          return { recentItems: [next, ...withoutDup].slice(0, MAX_RECENT) };
        });
      },

      removeRecentItem: (id) => {
        set((state) => ({ recentItems: state.recentItems.filter((r) => r.id !== id) }));
      },

      clearRecentItems: () => set({ recentItems: [] }),

      addSavedFilterView: (name, query) => {
        set((state) => {
          const id = `view_${Date.now()}`;
          const entry: SavedFilterView = { id, name: name.trim() || 'Untitled', query: { ...query }, savedAt: Date.now() };
          return { savedFilterViews: [entry, ...state.savedFilterViews].slice(0, MAX_SAVED_VIEWS) };
        });
      },

      removeSavedFilterView: (id) => {
        set((state) => ({ savedFilterViews: state.savedFilterViews.filter((v) => v.id !== id) }));
      },

      setWorkspacePreferences: (partial) => {
        set((state) => ({
          workspacePreferences: { ...state.workspacePreferences, ...partial }
        }));
      },

      setLastTableFilters: (tableId, query) => {
        const wp = get().workspacePreferences;
        set({
          workspacePreferences: {
            ...wp,
            lastTableFilters: { ...wp.lastTableFilters, [tableId]: query }
          }
        });
      }
    }),
    {
      name: 'workspace-preferences-v1',
      partialize: (state) => ({
        recentItems: state.recentItems,
        savedFilterViews: state.savedFilterViews,
        workspacePreferences: state.workspacePreferences
      })
    }
  )
);
