import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Board Routes
router.get('/boards/me', taskController.getMyBoard);
router.get('/boards/:boardId', taskController.getBoardById);
router.get('/boards/:boardId/columns', taskController.getBoardColumns);
router.post('/boards/:boardId/columns', taskController.createColumn);

// Column Routes
router.patch('/columns/:columnId', taskController.updateColumn);
router.delete('/columns/:columnId', taskController.deleteColumn);

// Task Routes
router.get('/columns/:columnId/tasks', taskController.getTasks);
router.post('/columns/:columnId/tasks', taskController.createTask);
router.get('/tasks/:taskId', taskController.getTask);
router.patch('/tasks/:taskId', taskController.updateTask);
router.delete('/tasks/:taskId', taskController.deleteTask);

export default router;