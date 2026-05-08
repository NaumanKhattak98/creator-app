import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import type { User, Video, Workspace } from './types';

// ─── Seed workspaces ──────────────────────────────────────────────────────────

export const workspaces: Workspace[] = [
  {
    id: 'w1',
    name: 'Kayak',
    username: '@kayak.skills',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Kayak_Logo.svg/1200px-Kayak_Logo.svg.png',
    workspaceType: 'Skills',
  },
  {
    id: 'w2',
    name: 'Emirates',
    username: '@emirates.social',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/1200px-Emirates_logo.svg.png',
    workspaceType: 'Social',
  },
];

// ─── Seed users ───────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u1',
    name: 'Alex Carter',
    username: '@alexcreates',
    email: 'alex@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    bio: 'Content creator & digital storyteller.',
    profileImage: 'https://i.pravatar.cc/150?img=3',
    bannerImage: 'https://picsum.photos/seed/banner1/800/300',
    followers: 48200,
    totalViews: 1230000,
    workspaces,
    activeWorkspaceId: 'w1',
    kycCompleted: false,
    country: 'United States',
    language: 'English',
  },
];

// ─── Seed videos ──────────────────────────────────────────────────────────────

function makeAnalytics(base: number) {
  return {
    income: base * 0.05,
    views: base,
    likes: Math.floor(base * 0.08),
    comments: Math.floor(base * 0.02),
    shares: Math.floor(base * 0.03),
    watchTime: Math.floor(base * 45),
    totalTraffic: Math.floor(base * 1.2),
    referralLink: `https://app.creatorportal.io/r/${uuid().slice(0, 8)}`,
    weekly:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(label => ({ label, views: Math.floor(Math.random() * base / 7), income: Math.random() * 10 })),
    monthly: ['W1','W2','W3','W4'].map(label => ({ label, views: Math.floor(Math.random() * base / 4), income: Math.random() * 40 })),
    yearly:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(label => ({ label, views: Math.floor(Math.random() * base / 12), income: Math.random() * 100 })),
  };
}

export const videos: Video[] = [
  {
    id: 'v1', workspaceId: 'w1', status: 'live', duration: 60,
    title: 'Getting Started with Kayak',
    description: 'A quick intro to booking your first trip.',
    thumbnailUrl: 'https://picsum.photos/seed/v1/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't1', label: 'Tutorial' }],
    createdAt: '2024-03-18T10:00:00Z',
    analytics: makeAnalytics(12400),
  },
  {
    id: 'v2', workspaceId: 'w1', status: 'live', duration: 90,
    title: 'Top 10 Travel Hacks',
    description: 'Save money on every booking.',
    thumbnailUrl: 'https://picsum.photos/seed/v2/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't2', label: 'Lifestyle' }],
    createdAt: '2024-03-25T14:00:00Z',
    analytics: makeAnalytics(9800),
  },
  {
    id: 'v3', workspaceId: 'w1', status: 'pending', duration: 45,
    title: 'Behind the Scenes: Kayak HQ',
    description: 'An exclusive look inside our office.',
    thumbnailUrl: 'https://picsum.photos/seed/v3/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't3', label: 'BTS' }],
    createdAt: '2024-04-01T09:00:00Z',
    analytics: makeAnalytics(0),
  },
  {
    id: 'v4', workspaceId: 'w1', status: 'rejected', duration: 120,
    title: 'Flight Deal Breakdown',
    description: 'How we find the cheapest flights.',
    thumbnailUrl: 'https://picsum.photos/seed/v4/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't4', label: 'Review' }],
    createdAt: '2024-04-10T11:00:00Z',
    analytics: makeAnalytics(0),
  },
  {
    id: 'v5', workspaceId: 'w2', status: 'live', duration: 75,
    title: 'Emirates Business Class Experience',
    description: 'Flying the A380 from Dubai to London.',
    thumbnailUrl: 'https://picsum.photos/seed/v5/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't5', label: 'Review' }],
    createdAt: '2024-04-15T08:00:00Z',
    analytics: makeAnalytics(24600),
  },
  {
    id: 'v6', workspaceId: 'w2', status: 'revise', duration: 30,
    title: 'Dubai Layover Guide',
    description: 'Make the most of a layover in Dubai.',
    thumbnailUrl: 'https://picsum.photos/seed/v6/400/720',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    tags: [{ id: 't6', label: 'Tutorial' }],
    createdAt: '2024-05-03T16:00:00Z',
    analytics: makeAnalytics(0),
  },
];

// ─── Invite codes ─────────────────────────────────────────────────────────────

export const VALID_INVITE_CODES = new Set(['CREATOR2025', 'BETA2024', 'LAUNCH2025']);
