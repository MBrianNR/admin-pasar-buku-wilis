import { Router } from 'express';
import { getDenah, perbaruiDenah } from '../controllers/denahController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', verifyToken, getDenah);
router.post('/update', verifyToken, perbaruiDenah);

export default router;
