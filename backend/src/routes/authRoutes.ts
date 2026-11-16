import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateLogin, validateRegister } from '../middlewares/validator.js';

const router = Router();

// Cek Data -> Controller
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Cek Token -> Controller
router.get('/me', verifyToken, me);

export default router;
