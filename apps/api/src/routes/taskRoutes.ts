import { Router } from 'express';
import { updateTask, deleteTask } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import commentRoutes from './commentRoutes'; 

const router = Router();

router.use(authenticate);

router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

router.use('/', commentRoutes);// Mount Comments here: /tasks/:taskId/comments

export default router;