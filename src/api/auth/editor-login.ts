// src/api/auth/editor-login.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_PASSWORD || !JWT_SECRET) {
  console.error('❌ Missing ADMIN_PASSWORD or JWT_SECRET in .env');
  // throw here prevents server start if missing — keep it so you don't accidentally deploy insecurely
  throw new Error('Missing ADMIN_PASSWORD or JWT_SECRET in environment');
}

router.post('/editor-login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body || {};
    if (!password) return res.status(400).json({ ok: false, error: 'No password provided' });

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ ok: false, error: 'Invalid password' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, {
      expiresIn: '999y',
    });

    // cookie options — dev vs prod
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('editor_token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd, // secure only over HTTPS / prod
      path: '/',
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
    });

    return res.json({ ok: true });
  } catch (err: any) {
    console.error('Editor login failed', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
