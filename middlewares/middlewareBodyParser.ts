import express, {Router} from 'express';
const router = Router();

router.use('*',express.urlencoded({ extended: true }));
router.use('*',express.json());

export default router;