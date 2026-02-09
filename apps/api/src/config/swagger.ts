import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Team Boards API",
      version: "1.0.0",
      description: "A kanban-style board API with tasks and comments",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication required or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        BadRequestError: {
          description: "Invalid request parameters or body",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            user_id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Board: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            ownerId: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Column: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            position: { type: "integer" },
            boardId: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
            columnId: { type: "string", format: "uuid" },
            authorId: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            content: { type: "string" },
            taskId: { type: "string", format: "uuid" },
            authorId: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  enum: [
                    "BAD_REQUEST",
                    "UNAUTHORIZED",
                    "FORBIDDEN",
                    "NOT_FOUND",
                    "CONFLICT",
                    "INTERNAL",
                  ],
                },
                message: { type: "string" },
                details: { type: "array", items: { type: "object" } },
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.route.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
