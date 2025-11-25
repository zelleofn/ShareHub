const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cloud File Storage API',
            version: '1.0.0',
            description: 'API documentation for file upload, download, sharing and user authentication',
        },
        
        servers: [
            {
                url: 'http://localhost:5000'
            }
        ]

    },
        
        apis: ['./app.js'],
    };

    const specs = swaggerJsdoc(options);

    module.exports = { swaggerUi, specs};

