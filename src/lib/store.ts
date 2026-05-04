import { create } from "zustand"

// ─── Auth Store ──────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ─── Theme Store ─────────────────────────────────────────────────────────────────

type ThemeMode = "light" | "dark"

interface ThemeState {
  themeMode: ThemeMode
  toggleTheme: () => void
  setThemeMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: "light",
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === "light" ? "dark" : "light",
    })),
  setThemeMode: (mode) => set({ themeMode: mode }),
}))

// ─── Editor Store ────────────────────────────────────────────────────────────────

type EditorTab =
  | "info"
  | "appearance"
  | "social"
  | "contact"
  | "location"
  | "slides"
  | "menu"
  | "gallery"
  | "services"
  | "testimonials"
  | "links"
  | "orders"
  | "settings"

interface EditorState {
  activeTab: EditorTab
  hasUnsavedChanges: boolean
  setActiveTab: (tab: EditorTab) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTab: "info",
  hasUnsavedChanges: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
}))
