import {Router, urlencoded, json} from 'express';
const router = Router();

import useragent from 'express-useragent';
router.use(useragent.express());

export default router;