// src/routes/index.ts
import { Router } from 'express';
import authRouter from './auth.routes';
import adminRouter from './admin.routes'
/* 
import orderRouter from './order.routes';
 */

const router = Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter)
// router.use('/products', productRouter);
/* 
router.use('/orders', orderRouter);
router.use('/admin', adminRouter); // Mount admin routes under /api/admin */

export default router;