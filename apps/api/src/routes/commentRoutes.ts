import { Router } from 'express';
import { getTaskComments, createComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:taskId/comments', getTaskComments);
router.post('/:taskId/comments', createComment);

export default router;