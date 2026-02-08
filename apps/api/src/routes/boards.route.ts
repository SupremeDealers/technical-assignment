import { Router } from "express";
import { BoardController } from "../controllers/board.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();
const boardController = new BoardController();
const authMiddleware = new AuthMiddleware();

// All board routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * tags:
 *   name: Boards
 *   description: Board management
 */

/**
 * @swagger
 * /boards:
 *   get:
 *     summary: Get all boards for the authenticated user
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", boardController.getUserBoards);

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Board name
 *               description:
 *                 type: string
 *                 description: Board description
 *               columns:
 *                 type: array
 *                 description: Columns to create with the board
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Column name
 *                     position:
 *                       type: integer
 *                       description: Column position/order
 *     responses:
 *       201:
 *         description: Board created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", boardController.createBoard);

/**
 * @swagger
 * /boards/{boardId}:
 *   get:
 *     summary: Get a board by ID (no columns)
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board data (no columns)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:boardId", boardController.getBoard);

/**
 * @swagger
 * /boards/{boardId}/details:
 *   get:
 *     summary: Get board details (board, columns, and tasks count per column)
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board details with columns and tasks count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 board:
 *                   $ref: '#/components/schemas/Board'
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       column_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       position:
 *                         type: integer
 *                       tasks_count:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:boardId/details", boardController.getBoardDetails);

/**
 * @swagger
 * /boards/{boardId}:
 *   patch:
 *     summary: Update a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Board name
 *               description:
 *                 type: string
 *                 description: Board description
 *               columns:
 *                 type: array
 *                 description: Columns to update/create for the board
 *                 items:
 *                   type: object
 *                   properties:
 *                     column_id:
 *                       type: string
 *                       description: Column ID (for updates only)
 *                     name:
 *                       type: string
 *                       description: Column name
 *                     position:
 *                       type: integer
 *                       description: Column position/order
 *     responses:
 *       200:
 *         description: Board updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/:boardId", boardController.updateBoard);

/**
 * @swagger
 * /boards/{boardId}:
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       204:
 *         description: Board deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:boardId", boardController.deleteBoard);

/**
 * @swagger
 * /boards/{boardId}/columns:
 *   get:
 *     summary: Get columns for a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: List of columns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Column'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:boardId/columns", boardController.getColumns);

/**
 * @swagger
 * /boards/{boardId}/columns:
 *   post:
 *     summary: Create a column in a board
 *     tags: [Boards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Column'
 *     responses:
 *       201:
 *         description: Column created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/:boardId/columns", boardController.createColumn);

export default router;
