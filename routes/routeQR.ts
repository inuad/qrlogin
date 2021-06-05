import { Router } from 'express';
import * as controller from '../controllers/controllerQR';

const router = Router();
router.get('/generate', controller.generateQR);
router.post('/query', controller.checkState);
router.get('/authorized/:sess_id', controller.checkAuthorizedState);
router.post('/authorized', controller.authorizeDevice);

export default router;