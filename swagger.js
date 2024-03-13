// Init swagger
const swaggerAutogenModule = require('swagger-autogen');
const swaggerAutogen = swaggerAutogenModule();
 
const doc = {
    info : {
        title: 'Mon API',
        description : 'Mon API',
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http']
};
 
// Le chemin de le generation des definitions swagger
const outputFile = "./swagger_output.json";
 
// les chemins ou sont developpées mes routes
const endpointFiles = ['./app.js'];
 
swaggerAutogen(outputFile, endpointFiles, doc);