// src/api/auth/editor-logout.ts
import { Router, Request, Response } from 'express';
const router = Router();

router.post('/editor-logout', (req: Request, res: Response) => {
  res.clearCookie('editor_token', { path: '/' });
  return res.json({ ok: true });
});

export default router;
