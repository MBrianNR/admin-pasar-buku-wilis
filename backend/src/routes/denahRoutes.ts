import { Router } from 'express';
import { getDenah, perbaruiDenah } from '../controllers/denahController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyToken, getDenah);
router.post('/update', verifyToken, perbaruiDenah);

export default router;
