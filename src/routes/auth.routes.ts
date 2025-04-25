// src/routes/auth.routes.ts

import { Router } from 'express';
// Import the controller functions we'll define next
import * as authController from '../controllers/auth.controller';
// Optional: Import middleware for specific routes if needed (e.g., input validation)
// import { validateLoginInput } from '@/middleware/validation.middleware.js';
// Optional: Import auth middleware if some auth routes require login (e.g., /me, /refresh-token)
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', /* validateRegistrationInput, */ authController.registerUser);
router.post('/login', /* validateLoginInput, */ authController.loginUser);
router.get('/me', authMiddleware, authController.getCurrentUser);

// POST /api/auth/logout - User Logout (Optional: depends on implementation)
// Might need auth middleware if logout requires knowing *who* is logging out
// router.post('/logout', authenticateToken, authController.logoutUser);

// POST /api/auth/refresh-token - Refresh JWT (Example, depends on auth strategy)
// router.post('/refresh', authController.refreshToken);


// Export the router instance to be used in src/routes/index.ts
export default router;