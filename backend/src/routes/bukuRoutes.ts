import { Router } from 'express';
import { createBuku, deleteBuku, getBuku, getBukuById, updateBuku } from '../controllers/bukuController';
import { verifyToken } from '../middlewares/authMiddleware';
import { validateBuku, validateNumericId, validateUpdateBuku } from '../middlewares/validator';

const router = Router();

router.get('/', verifyToken, getBuku);
router.get('/:id', verifyToken, validateNumericId, getBukuById);
router.post('/', verifyToken, validateBuku, createBuku);
router.put('/:id', verifyToken, validateNumericId, validateUpdateBuku, updateBuku);
router.delete('/:id', verifyToken, validateNumericId, deleteBuku);

export default router;
