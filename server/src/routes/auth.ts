import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { users, workspaces, VALID_INVITE_CODES } from '../db';
import { JWT_SECRET, JWT_EXPIRES } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import type { LoginBody, GoogleAuthBody, AppleAuthBody, ValidateInviteBody, SetupProfileBody } from '../types';

const router = Router();

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES } as object);
}

function safeUser(user: (typeof users)[0]) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /auth/login
router.post('/login', (req: Request<{}, {}, LoginBody>, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  res.json({ token: signToken(user.id), user: safeUser(user) });
});

// POST /auth/google
router.post('/google', (req: Request<{}, {}, GoogleAuthBody>, res: Response): void => {
  // In production: verify oauthToken with Google, fetch profile, upsert user
  const { oauthToken } = req.body;
  if (!oauthToken) {
    res.status(400).json({ error: 'oauthToken is required' });
    return;
  }

  // For testing: always return the seeded user
  const user = users[0];
  res.json({ token: signToken(user.id), user: safeUser(user) });
});

// POST /auth/apple
router.post('/apple', (req: Request<{}, {}, AppleAuthBody>, res: Response): void => {
  // In production: verify oauthToken with Apple, fetch profile, upsert user
  const { oauthToken } = req.body;
  if (!oauthToken) {
    res.status(400).json({ error: 'oauthToken is required' });
    return;
  }

  const user = users[0];
  res.json({ token: signToken(user.id), user: safeUser(user) });
});

// POST /auth/validate-invite
router.post('/validate-invite', (req: Request<{}, {}, ValidateInviteBody>, res: Response): void => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: 'code is required' });
    return;
  }

  if (!VALID_INVITE_CODES.has(code.toUpperCase())) {
    res.status(400).json({ error: 'Invalid invite code' });
    return;
  }

  res.json({ valid: true, workspaces });
});

// POST /auth/logout  (client just discards the token; server can blacklist if needed)
router.post('/logout', authenticate, (_req: AuthRequest, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
