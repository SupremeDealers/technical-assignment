import { Router } from 'express';
import { createBoard, createColumn, deleteBoard, deleteColumn,updateColumn } from '../controllers/adminController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// apply middleware to ALL admin related routes
router.use(authenticate, isAdmin);

router.post('/boards', createBoard);
router.delete('/boards/:boardId', deleteBoard);

router.post('/boards/:boardId/columns', createColumn);
router.patch('/columns/:columnId', updateColumn);
router.delete('/columns/:columnId', deleteColumn);

export default router;