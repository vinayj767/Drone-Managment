import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drone Management System API',
      version: '1.0.0',
      description: 'A comprehensive API for managing drone operations, missions, and fleet monitoring',
      contact: {
        name: 'Drone Management Team',
        email: 'support@dronemanagement.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'pilot'] },
            phone: { type: 'string' },
            isActive: { type: 'boolean' },
            pilotLicense: { type: 'string' },
            experience: { type: 'number' },
            specializations: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Drone: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            droneModel: { type: 'string' },
            manufacturer: { type: 'string' },
            serialNumber: { type: 'string' },
            type: { type: 'string', enum: ['quadcopter', 'hexacopter', 'octocopter', 'fixed-wing'] },
            status: { type: 'string', enum: ['available', 'in-mission', 'maintenance', 'offline', 'charging'] },
            batteryLevel: { type: 'number', minimum: 0, maximum: 100 },
            flightHours: { type: 'number' },
            maxFlightTime: { type: 'number' },
            maxRange: { type: 'number' },
            maxAltitude: { type: 'number' },
            maxSpeed: { type: 'number' },
            weight: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Mission: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['survey', 'inspection', 'monitoring', 'emergency', 'commercial'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            status: { type: 'string', enum: ['planned', 'in-progress', 'paused', 'completed', 'aborted', 'failed'] },
            assignedPilot: { type: 'string' },
            assignedDrone: { type: 'string' },
            scheduledStart: { type: 'string', format: 'date-time' },
            scheduledEnd: { type: 'string', format: 'date-time' },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Report: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            missionId: { type: 'string' },
            title: { type: 'string' },
            summary: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'pending-review', 'approved', 'rejected'] },
            generatedBy: { type: 'string' },
            generatedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const swaggerSetup = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Drone Management API Documentation'
  }));
};