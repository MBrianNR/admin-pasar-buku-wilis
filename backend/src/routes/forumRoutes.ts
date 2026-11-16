import { Router } from 'express';
import { approvePost, createPost, deletePost, getForum } from '../controllers/forumController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateForum, validateNumericId } from '../middlewares/validator.js';

const router = Router();

router.get('/', verifyToken, getForum);
router.post('/', verifyToken, validateForum, createPost);
router.patch('/:id/approve', verifyToken, validateNumericId, approvePost);
router.delete('/:id', verifyToken, validateNumericId, deletePost);

export default router;
