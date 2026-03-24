import type { Request, Response, NextFunction } from 'express';
import { getSessionByToken, getUserByOpenId } from './storage.js';
import type { UserRow } from './storage.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserRow;
      sessionToken?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const token = authHeader.slice(7);

  getSessionByToken(token).then((session) => {
    if (!session) {
      res.status(401).json({ error: 'invalid_session' });
      return;
    }
    return getUserByOpenId(session.open_id).then((user) => {
      if (!user) {
        res.status(401).json({ error: 'user_not_found' });
        return;
      }
      req.user = user;
      req.sessionToken = token;
      next();
    });
  }).catch(next);
}
