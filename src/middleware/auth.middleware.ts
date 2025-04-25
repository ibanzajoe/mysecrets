import { NextFunction, Request, Response } from 'express';
import { HttpErrors } from '../utils/httpErrors';
import { authService, userService } from '../services';
import { TCurrentUser } from '../schema/users.schema';

async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const bearerToken = req.headers.authorization as string;
  const token = bearerToken?.split(' ')[1] as string;
  try {
    const isTokenValid: any = await authService.verifyToken(token);
    if (!isTokenValid) {
      throw HttpErrors.Unauthorized('Token is invalid');
    }
    const userId = isTokenValid.userId;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || req.get('user-agent');
    if (userId) {
      const user = await userService.getUserById(userId);
      req.user = {
        ...user,
        ip,
        userAgent
      } as TCurrentUser;
    }

    return next();
  } catch (e) {
    throw HttpErrors.Unauthorized(`User unauthorized: uid: ${e}`);
  }
}

const authMiddleware = [AuthMiddleware];

export { authMiddleware };
