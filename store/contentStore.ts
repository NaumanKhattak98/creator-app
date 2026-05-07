import { create } from 'zustand';
import { Video } from '../types';
import { MOCK_VIDEOS } from '../constants/mock';

interface ContentState {
  videos: Video[];
  isLoading: boolean;
  fetchVideos: (workspaceId: string) => Promise<void>;
  deleteVideo: (id: string) => void;
  addVideo: (video: Video) => void;
  updateVideo: (id: string, data: Partial<Video>) => void;
}

export const useContentStore = create<ContentState>((set, get) => ({
  videos: [],
  isLoading: false,

  fetchVideos: async (workspaceId) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 800));
    set({
      videos: MOCK_VIDEOS.filter((v) => v.workspaceId === workspaceId),
      isLoading: false,
    });
  },

  deleteVideo: (id) => {
    set({ videos: get().videos.filter((v) => v.id !== id) });
  },

  addVideo: (video) => {
    set({ videos: [video, ...get().videos] });
  },

  updateVideo: (id, data) => {
    set({
      videos: get().videos.map((v) => (v.id === id ? { ...v, ...data } : v)),
    });
  },
}));
