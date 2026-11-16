import { Router } from 'express';
import { approvePost, createPost, deletePost, getForum } from '../controllers/forumController';
import { verifyToken } from '../middlewares/authMiddleware';
import { validateForum, validateNumericId } from '../middlewares/validator';

const router = Router();

router.get('/', verifyToken, getForum);
router.post('/', verifyToken, validateForum, createPost);
router.patch('/:id/approve', verifyToken, validateNumericId, approvePost);
router.delete('/:id', verifyToken, validateNumericId, deletePost);

export default router;
