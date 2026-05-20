import { create } from 'zustand';
import type { AuthSession, AuthState } from '../types/auth.types';
import type { Role } from '../config/roles';
import { AUTH_COOKIE_NAMES } from '../config/roles';
import type { User } from '../types/user.types';

type AuthStoreActions = {
  setSession: (session: AuthSession) => void;
  setAccessToken: (accessToken: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  setRole: (role: Role | null) => void;
  setLoading: (isLoading: boolean) => void;
  hydrateFromStorage: () => void;
  logout: () => void;
};

export type AuthStore = AuthState & AuthStoreActions;

const AUTH_STORAGE_KEY = 'verdict_auth_session';

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

function persistSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!session?.accessToken) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      deleteCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN);
      deleteCookie(AUTH_COOKIE_NAMES.ROLE);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    writeCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, session.accessToken, 60 * 60 * 24);

    if (session.role) {
      writeCookie(AUTH_COOKIE_NAMES.ROLE, session.role, 60 * 60 * 24);
    } else {
      deleteCookie(AUTH_COOKIE_NAMES.ROLE);
    }
  } catch {
    // Storage access can fail in hardened browsers; keep state in memory.
  }
}

const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoading: true,
  setSession: (session) => {
    const normalizedSession: AuthSession = {
      accessToken: session.accessToken ?? null,
      user: session.user ?? null,
      role: session.role ?? null,
      expiresIn: session.expiresIn ?? null
    };

    set({
      accessToken: normalizedSession.accessToken,
      user: normalizedSession.user,
      role: normalizedSession.role,
      isAuthenticated: Boolean(normalizedSession.accessToken),
      isLoading: false
    });

    persistSession(normalizedSession);
  },
  setAccessToken: (accessToken) => {
    const session: AuthSession = {
      accessToken,
      user: get().user,
      role: get().role,
      expiresIn: null
    };

    set({ accessToken, isAuthenticated: Boolean(accessToken), isLoading: false });
    persistSession(session);
  },
  setCurrentUser: (user) => {
    const session: AuthSession = {
      accessToken: get().accessToken,
      user,
      role: user?.role ?? null,
      expiresIn: null
    };

    set({ user, role: user?.role ?? null, isAuthenticated: Boolean(get().accessToken), isLoading: false });
    persistSession(session);
  },
  setRole: (role) => {
    const session: AuthSession = {
      accessToken: get().accessToken,
      user: get().user,
      role,
      expiresIn: null
    };

    set({ role });
    persistSession(session);
  },
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  hydrateFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isHydrated: true, isLoading: false });
      return;
    }

    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        set({ isHydrated: true, isLoading: false });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      const accessToken = parsed.accessToken ?? null;
      const user = parsed.user ?? null;
      const role = parsed.role ?? user?.role ?? null;

      set({
        accessToken,
        user,
        role,
        isAuthenticated: Boolean(accessToken),
        isHydrated: true,
        isLoading: false
      });

      if (accessToken) {
        writeCookie(AUTH_COOKIE_NAMES.ACCESS_TOKEN, accessToken, 60 * 60 * 24);
      }

      if (role) {
        writeCookie(AUTH_COOKIE_NAMES.ROLE, role, 60 * 60 * 24);
      }
    } catch {
      set({ isHydrated: true, isLoading: false });
    }
  },
  logout: () => {
    set({
      accessToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false
    });

    persistSession(null);
  }
}));

export default useAuthStore;
