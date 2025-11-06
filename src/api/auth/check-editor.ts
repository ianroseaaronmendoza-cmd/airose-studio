// src/api/auth/check-editor.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get('/check-editor', (req: Request, res: Response) => {
  try {
    const token = req.cookies?.editor_token;
    if (!token) return res.status(401).json({ authenticated: false });

    if (!JWT_SECRET) return res.status(500).json({ authenticated: false });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.json({ authenticated: true, payload });
    } catch {
      return res.status(401).json({ authenticated: false });
    }
  } catch (err) {
    console.error('check-editor error', err);
    return res.status(500).json({ authenticated: false });
  }
});

export default router;
