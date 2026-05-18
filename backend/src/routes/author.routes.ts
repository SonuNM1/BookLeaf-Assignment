import { Router } from 'express';
import {
  getMyProfile,
  getMyBooks,
  getMyRoyalties,
} from '../controllers/author.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect, restrictTo('author'));

router.get('/me', getMyProfile);
router.get('/me/books', getMyBooks);
router.get('/me/royalties', getMyRoyalties);

export default router;