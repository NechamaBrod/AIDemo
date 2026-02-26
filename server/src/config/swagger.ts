import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechStore API',
      version: '1.0.0',
      description: 'API documentation for TechStore backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        TodaysOrdersCountResponse: {
          type: 'object',
          properties: {
            todaysOrdersCount: {
              type: 'integer',
              description: 'מספר ההזמנות של היום (ללא cancelled/returned)',
              example: 42,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Internal server error',
            },
          },
        },
      },
    },
  },
  // סריקת כל קבצי ה-JS וה-TS בתוך routes ו-controllers לאיתור @swagger comments
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../routes/*.ts'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../controllers/*.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
