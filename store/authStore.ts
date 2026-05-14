import { create } from 'zustand';
import { User, Workspace } from '../types';
import { MOCK_USER, MOCK_WORKSPACES } from '../constants/mock';

interface AuthState {
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  user: User | null;
  inviteCode: string;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  validateInvite: (code: string) => Promise<Workspace[]>;
  setupProfile: (data: Partial<User>) => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  hasSeenOnboarding: false,
  user: null,
  inviteCode: '',

  login: async (email, password) => {
    await new Promise((r) => setTimeout(r, 1000));
    set({ isAuthenticated: true, user: MOCK_USER });
  },

  loginWithGoogle: async () => {
    await new Promise((r) => setTimeout(r, 800));
    set({ isAuthenticated: true, user: MOCK_USER });
  },

  loginWithApple: async () => {
    await new Promise((r) => setTimeout(r, 800));
    set({ isAuthenticated: true, user: MOCK_USER });
  },

  validateInvite: async (code) => {
    await new Promise((r) => setTimeout(r, 800));
    if (code.toUpperCase() === 'CREATOR2025') {
      set({ inviteCode: code });
      return MOCK_WORKSPACES.slice(0, 2);
    }
    throw new Error('Invalid invite code');
  },

  setupProfile: async (data) => {
    await new Promise((r) => setTimeout(r, 1000));
    set({
      isAuthenticated: true,
      user: { ...MOCK_USER, ...data },
    });
  },

  switchWorkspace: (workspaceId) => {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, activeWorkspaceId: workspaceId } });
  },

  updateUser: (data) => {
    const user = get().user;
    if (!user) return;
    set({ user: { ...user, ...data } });
  },

  completeOnboarding: () => set({ hasSeenOnboarding: true }),
  logout: () => set({ isAuthenticated: false, user: null, inviteCode: '', hasSeenOnboarding: false }),
}));
