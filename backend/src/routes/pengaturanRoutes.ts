import { Router } from 'express';
import { getPengaturan, updatePengaturan } from '../controllers/pengaturanController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validatePengaturan } from '../middlewares/validator.js';

const router = Router();

router.get('/', verifyToken, getPengaturan);
router.put('/', verifyToken, validatePengaturan, updatePengaturan);

export default router;
