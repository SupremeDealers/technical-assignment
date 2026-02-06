import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Board Routes (Consolidated here for simplicity)
router.get('/boards/me', taskController.getMyBoard);

// Task Routes
router.get('/columns/:columnId/tasks', taskController.getTasks);
router.post('/columns/:columnId/tasks', taskController.createTask);
router.patch('/tasks/:taskId', taskController.updateTask);
router.delete('/tasks/:taskId', taskController.deleteTask);

export default router;