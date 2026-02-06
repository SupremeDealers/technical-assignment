import { Router } from 'express';
import { getTasksByColumn, createTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getTasksByColumn);
router.post('/', createTask);

export default router;