import { Router } from 'express';
import {
    approveKios,
    createKios,
    deleteKios,
    exportKios,
    getKios,
    getKiosById,
    updateKios
} from '../controllers/kiosController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateKios, validateKiosIdParam, validateUpdateKios } from '../middlewares/validator.js';

const router = Router();

router.get('/', verifyToken, getKios);
router.get('/export', verifyToken, exportKios); // harus di atas '/:id'
router.get('/:id', verifyToken, validateKiosIdParam, getKiosById);
router.post('/', verifyToken, validateKios, createKios);
router.put('/:id', verifyToken, validateKiosIdParam, validateUpdateKios, updateKios);
router.patch('/:id/approve', verifyToken, validateKiosIdParam, approveKios);
router.delete('/:id', verifyToken, validateKiosIdParam, deleteKios);

export default router;
