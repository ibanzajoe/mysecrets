import { TCurrentUser } from '../schema/users.schema';

declare global {
  namespace Express {
    interface Request {
      user?: TCurrentUser;
      cart?: any; // You can type this more specifically if needed
    }
  }
} 