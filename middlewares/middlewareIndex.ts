import {Router} from 'express'
const router = Router();

import middlewareUserAgent from './middlewareUserAgent';
import middlewareBodyParser from './middlewareBodyParser';
router.use('/', middlewareUserAgent);
router.use('/', middlewareBodyParser);

export default router;