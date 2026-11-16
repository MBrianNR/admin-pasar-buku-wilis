import { Router } from 'express';
import { createBuku, deleteBuku, getBuku, getBukuById, updateBuku } from '../controllers/bukuController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateBuku, validateNumericId, validateUpdateBuku } from '../middlewares/validator.js';

const router = Router();

router.get('/', verifyToken, getBuku);
router.get('/:id', verifyToken, validateNumericId, getBukuById);
router.post('/', verifyToken, validateBuku, createBuku);
router.put('/:id', verifyToken, validateNumericId, validateUpdateBuku, updateBuku);
router.delete('/:id', verifyToken, validateNumericId, deleteBuku);

export default router;
