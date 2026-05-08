import { Router, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { videos, users } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { CreateVideoBody, UpdateVideoBody } from '../types';

const router = Router();

function makeDefaultAnalytics() {
  return {
    income: 0, views: 0, likes: 0, comments: 0,
    shares: 0, watchTime: 0, totalTraffic: 0,
    referralLink: `https://app.creatorportal.io/r/${uuid().slice(0, 8)}`,
    weekly:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(l => ({ label: l, views: 0, income: 0 })),
    monthly: ['W1','W2','W3','W4'].map(l => ({ label: l, views: 0, income: 0 })),
    yearly:  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(l => ({ label: l, views: 0, income: 0 })),
  };
}

// GET /workspace/:workspaceId/videos
router.get('/workspace/:workspaceId/videos', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const hasAccess = user.workspaces.some(w => w.id === req.params.workspaceId);
  if (!hasAccess) { res.status(403).json({ error: 'Access denied to this workspace' }); return; }

  const result = videos
    .filter(v => v.workspaceId === req.params.workspaceId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

// GET /videos/:id
router.get('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) { res.status(404).json({ error: 'Video not found' }); return; }

  const user = users.find(u => u.id === req.userId);
  const hasAccess = user?.workspaces.some(w => w.id === video.workspaceId);
  if (!hasAccess) { res.status(403).json({ error: 'Access denied' }); return; }

  res.json(video);
});

// POST /videos
router.post('/', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const body = req.body as CreateVideoBody;
  const { title, description, thumbnailUrl, videoUrl, tags, cta, workspaceId, duration } = body;

  if (!title || !workspaceId) {
    res.status(400).json({ error: 'title and workspaceId are required' });
    return;
  }

  const hasAccess = user.workspaces.some(w => w.id === workspaceId);
  if (!hasAccess) { res.status(403).json({ error: 'Access denied to this workspace' }); return; }

  const newVideo = {
    id: uuid(),
    title,
    description: description ?? '',
    thumbnailUrl: thumbnailUrl ?? '',
    videoUrl: videoUrl ?? '',
    status: 'pending' as const,
    tags: tags ?? [],
    cta,
    workspaceId,
    duration: duration ?? 0,
    createdAt: new Date().toISOString(),
    analytics: makeDefaultAnalytics(),
  };

  videos.unshift(newVideo);
  res.status(201).json(newVideo);
});

// PATCH /videos/:id
router.patch('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) { res.status(404).json({ error: 'Video not found' }); return; }

  const user = users.find(u => u.id === req.userId);
  const hasAccess = user?.workspaces.some(w => w.id === video.workspaceId);
  if (!hasAccess) { res.status(403).json({ error: 'Access denied' }); return; }

  const body = req.body as UpdateVideoBody;
  const allowed: (keyof UpdateVideoBody)[] = ['title', 'description', 'tags', 'cta', 'status', 'thumbnailUrl', 'videoUrl', 'duration'];
  allowed.forEach(key => {
    if (body[key] !== undefined) (video as any)[key] = body[key];
  });

  res.json(video);
});

// DELETE /videos/:id
router.delete('/:id', authenticate, (req: AuthRequest, res: Response): void => {
  const index = videos.findIndex(v => v.id === req.params.id);
  if (index === -1) { res.status(404).json({ error: 'Video not found' }); return; }

  const user = users.find(u => u.id === req.userId);
  const hasAccess = user?.workspaces.some(w => w.id === videos[index].workspaceId);
  if (!hasAccess) { res.status(403).json({ error: 'Access denied' }); return; }

  videos.splice(index, 1);
  res.json({ message: 'Video deleted successfully' });
});

export default router;
