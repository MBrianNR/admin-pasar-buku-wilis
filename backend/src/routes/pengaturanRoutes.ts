import { Router } from 'express';
import { getPengaturan, updatePengaturan } from '../controllers/pengaturanController';
import { verifyToken } from '../middlewares/authMiddleware';
import { validatePengaturan } from '../middlewares/validator';

const router = Router();

router.get('/', verifyToken, getPengaturan);
router.put('/', verifyToken, validatePengaturan, updatePengaturan);

export default router;
