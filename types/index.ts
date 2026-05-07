export type VideoStatus = 'live' | 'pending' | 'rejected' | 'revise';

export type WorkspaceType = 'Social' | 'Skills';

export interface Workspace {
  id: string;
  name: string;
  username: string;
  logo: string;
  workspaceType: WorkspaceType;
}

export interface User {
  id: string;
  name: string;
  username: string;
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

export interface TimeSeriesData {
  label: string;
  views: number;
  income: number;
}

export type AnalyticsFilter = '1W' | '4W' | '1Y' | 'MTD' | 'QTD' | 'YTD' | 'ALL';
