/**
 * Swagger/OpenAPI configuration for CourseNexus API documentation
 * Generates interactive API documentation from JSDoc comments in route files
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CourseNexus API',
            version: '1.0.0',
            description: 'API documentation for the CourseNexus platform'
        },
        servers: [
            {
                url: process.env.BACKEND_URL,
                description: 'Backend server',
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token'
                }
            }
        },
    },
    // Paths to files containing OpenAPI definitions (JSDoc comments)
    apis: [
        './routes/**/*.js',
        './controllers/**/*.js',
      ],
}

const swaggerSpec = swaggerJsdoc(options);
module.exports = {
    swaggerSpec,
    swaggerUi
}