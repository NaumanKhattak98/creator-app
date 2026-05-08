// ─── Shared types (mirrors app/types/index.ts) ───────────────────────────────

export type WorkspaceType = 'Social' | 'Skills';
export type VideoStatus   = 'live' | 'pending' | 'rejected' | 'revise';

export interface Workspace {
  id: string;
  name: string;
  username: string;
  logo: string;
  workspaceType: WorkspaceType;
}

export interface Tag {
  id: string;
  label: string;
}

export interface CTA {
  id: string;
  type: 'redirect' | 'file';
  label: string;
  url?: string;
  fileUri?: string;
  fileName?: string;
}

export interface TimeSeriesData {
  label: string;
  views: number;
  income: number;
}

export interface Analytics {
  income: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number;
  totalTraffic: number;
  referralLink: string;
  weekly: TimeSeriesData[];
  monthly: TimeSeriesData[];
  yearly: TimeSeriesData[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: VideoStatus;
  tags: Tag[];
  cta?: CTA;
  workspaceId: string;
  createdAt: string;
  duration: number;
  analytics: Analytics;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  bio: string;
  profileImage: string;
  bannerImage: string;
  followers: number;
  totalViews: number;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  kycCompleted: boolean;
  country: string;
  language: string;
}

// ─── Request / Response shapes ────────────────────────────────────────────────

export interface LoginBody       { email: string; password: string; }
export interface GoogleAuthBody  { oauthToken: string; }
export interface AppleAuthBody   { oauthToken: string; }
export interface ValidateInviteBody { code: string; }
export interface SetupProfileBody   extends Partial<Omit<User, 'id' | 'passwordHash'>> {}
export interface UpdateUserBody     extends Partial<Omit<User, 'id' | 'passwordHash'>> {}
export interface CreateVideoBody    extends Omit<Video, 'id' | 'createdAt' | 'analytics'> {}
export interface UpdateVideoBody    extends Partial<Omit<Video, 'id' | 'workspaceId'>> {}
