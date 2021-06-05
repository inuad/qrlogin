import { Router } from 'express';
import routeQR from './routeQR';
const router = Router();

router.use('/api/v1/qr', routeQR);

export default router;