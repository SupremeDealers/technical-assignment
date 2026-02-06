import { Router } from 'express';
import { getAllBoards, getBoardById, getBoardColumns } from '../controllers/boardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAllBoards);
router.get('/:boardId', getBoardById);
router.get('/:boardId/columns', getBoardColumns);

export default router;