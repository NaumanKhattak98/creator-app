import express from 'express';
import cors from 'cors';
import authRoutes   from './routes/auth';
import userRoutes   from './routes/user';
import videoRoutes  from './routes/videos';
import { PORT } from './config';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health check (before route handlers) ────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',      authRoutes);
app.use('/user',      userRoutes);
app.use('/videos',    videoRoutes);
app.use('/workspace', videoRoutes);   // handles GET /workspace/:workspaceId/videos

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Creator App API running at http://localhost:${PORT}`);
  console.log(`\n📋  Endpoints:`);
  console.log(`   POST   /auth/login`);
  console.log(`   POST   /auth/google`);
  console.log(`   POST   /auth/apple`);
  console.log(`   POST   /auth/validate-invite`);
  console.log(`   POST   /auth/logout`);
  console.log(`   GET    /user/me`);
  console.log(`   POST   /user/profile`);
  console.log(`   PATCH  /user`);
  console.log(`   POST   /user/workspace/:workspaceId/activate`);
  console.log(`   GET    /workspace/:workspaceId/videos`);
  console.log(`   GET    /videos/:id`);
  console.log(`   POST   /videos`);
  console.log(`   PATCH  /videos/:id`);
  console.log(`   DELETE /videos/:id`);
  console.log(`   GET    /health\n`);
  console.log(`🔑  Test credentials:  alex@example.com / password123`);
  console.log(`🎟️  Test invite codes: CREATOR2025 · BETA2024 · LAUNCH2025\n`);
});

export default app;
