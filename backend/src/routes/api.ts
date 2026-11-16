import { Router } from 'express';
import authRoutes from './authRoutes';
import bukuRoutes from './bukuRoutes';
import dashboardRoutes from './dashboardRoutes';
import denahRoutes from './denahRoutes';
import forumRoutes from './forumRoutes';
import kiosRoutes from './kiosRoutes';
import pengaturanRoutes from './pengaturanRoutes';

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
