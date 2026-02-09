import { Router } from "express";
import { BoardController } from "../controllers/board.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();
const boardController = new BoardController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: Columns
 *   description: Column management
 */

// All column routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /columns/{column_id}:
 *   get:
 *     summary: Get a column by ID
 *     tags: [Columns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: column_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Column ID
 *     responses:
 *       200:
 *         description: Column found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:column_id", boardController.getColumnById);
/**
 * @swagger
 * /columns/{columnId}:
 *   patch:
 *     summary: Update a column
 *     tags: [Columns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         schema:
 *           type: string
 *         required: true
 *         description: Column ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Column'
 *     responses:
 *       200:
 *         description: Column updated
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
router.patch("/:columnId", boardController.updateColumn);

/**
 * @swagger
 * /columns/{columnId}:
 *   delete:
 *     summary: Delete a column
 *     tags: [Columns]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         schema:
 *           type: string
 *         required: true
 *         description: Column ID
 *     responses:
 *       204:
 *         description: Column deleted
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:columnId", boardController.deleteColumn);

export default router;
