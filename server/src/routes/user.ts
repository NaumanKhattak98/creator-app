import { Router, Request, Response } from 'express';
import { users } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { SetupProfileBody, UpdateUserBody } from '../types';

const router = Router();

function safeUser(user: (typeof users)[0]) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// GET /user/me
router.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(safeUser(user));
});

// POST /user/profile  (initial profile setup after invite)
router.post('/profile', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const body = req.body as SetupProfileBody;
  const allowed: (keyof SetupProfileBody)[] = [
    'name', 'username', 'bio', 'profileImage', 'bannerImage', 'country', 'language',
  ];
  allowed.forEach(key => {
    if (body[key] !== undefined) (user as any)[key] = body[key];
  });

  res.json(safeUser(user));
});

// PATCH /user  (update any user fields)
router.patch('/', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const body = req.body as UpdateUserBody;
  const allowed: (keyof UpdateUserBody)[] = [
    'name', 'username', 'bio', 'profileImage', 'bannerImage',
    'country', 'language', 'kycCompleted', 'activeWorkspaceId',
  ];
  allowed.forEach(key => {
    if (body[key] !== undefined) (user as any)[key] = body[key];
  });

  res.json(safeUser(user));
});

// POST /user/workspace/:workspaceId/activate
router.post('/workspace/:workspaceId/activate', authenticate, (req: AuthRequest, res: Response): void => {
  const user = users.find(u => u.id === req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const ws = user.workspaces.find(w => w.id === req.params.workspaceId);
  if (!ws) { res.status(404).json({ error: 'Workspace not found or not accessible' }); return; }

  user.activeWorkspaceId = ws.id;
  res.json({ activeWorkspaceId: ws.id, workspace: ws });
});

export default router;
