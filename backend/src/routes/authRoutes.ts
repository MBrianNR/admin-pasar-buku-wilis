import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';
import { validateLogin, validateRegister } from '../middlewares/validator';

const router = Router();

// Cek Data -> Controller
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Cek Token -> Controller
router.get('/me', verifyToken, me);

export default router;
