import { Router } from 'express';
import authRoutes from './authRoutes.js';
import bukuRoutes from './bukuRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import denahRoutes from './denahRoutes.js';
import forumRoutes from './forumRoutes.js';
import kiosRoutes from './kiosRoutes.js';
import pengaturanRoutes from './pengaturanRoutes.js';

// Peta jalan aplikasi: semua rute dipasang di bawah /api (lihat app.ts)
const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/kios', kiosRoutes);
router.use('/buku', bukuRoutes);
router.use('/forum', forumRoutes);
router.use('/pengaturan', pengaturanRoutes);
router.use('/denah', denahRoutes);

export default router;
