const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const Model = require("./Models/models.js")
const responseBuilder = require("./Helpers/responseBuilder.js")


const secretJwtKey = 'dorian'

// ======================== BDD ==========================//


const urlMongo = "mongodb://127.0.0.1:27017/db_demo";

mongoose.connect(urlMongo);

mongoose.connection.once('open', () => {
    console.log('Connecté a la base mongo');
})
mongoose.connection.on('error', (error) => 
{
    console.log("Erreur de connexion a la base Mongo")
})



// ======================== APP ==========================//

// Initialiser l'application
const app = express();

app.use(express.json());
app.use(cors());

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger_output.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Déclarer un middleware
async function tokenVerify(req, res, next)
{
    const token = req.headers['authorization']

    // Problème 1 pas de token
    if(!token)
    {
        return res.status(403).json({message : "Token non fourni"})
    }

    // Problème 2 : token non valide
    await jwt.verify(token, secretJwtKey, (err, decoded) =>{
        
        // Si erreur
        if(err)
        {
            return res.status(401).json({message : "Token invalide"})
        }

        // Si valide
    // Decodes => objet encodé

    req.user = decoded

    next()
    })

    

}

 app.post("/verify-token", async (req, res) => {

    const token = req.headers['authorization']

    // Problème 1 pas de token
    if(!token)
    {
        return responseBuilder(res,  "403",  "Token invalide", null)
    }

    // Problème 2 : token non valide
    let verifyResult = false;
    await jwt.verify(token, secretJwtKey, (err, decoded) =>{
        
        // Si erreur
        if(err)
        {
            verifyResult = false
            //return responseBuilder(res,  "403",  "Token invalide", null)
        }


        //return responseBuilder(res,  "200",  "Token valide", null)

    })

})


app.post("/login", async(req, res) => {

    const personneQuery = await Model.getModelPersonneComplete().findOne({"email" : req.body.email})

    if(personneQuery)
    {
        bcrypt.compare(req.body.motDePasse, personneQuery.motDePasse, function(err, result) {
        if (result) {
            
            const token = jwt.sign({mail : req.body.email}, secretJwtKey, {expiresIn : '1h'})

            return responseBuilder(res,  "200",  "Connection réussie", token)

        }
        else
        {
            return responseBuilder(res,  "403",  "Donnees Invalides", null)
        }
    });
    }

})


app.get("/persons", async(req, res) => {
    //
    // Select all avec mongodb
    const personnes = await Model.getModelPersonneComplete().find()
 
    return responseBuilder(res,  "200",  "Requette réussie", personnes)
})


app.get("/persons/:id", async (req, res) => {
    /*
        #swagger.description = 'Récupérer une personne grace a id'
     */
    const idRequest = parseInt(req.params.id);

    const personne = await Model.getModelPersonneComplete().findOne({id : idRequest})
 
    return responseBuilder(res,  "200",  "Requette réussie", personne)
});

app.post("/persons/create", async(req, res) => {

    console.log(req.body)

     bcrypt.hash(req.body.motDePasse, 10).then((hash) => {
        // Remplacer le mot de passe original par le hash
        req.body.motDePasse = hash;

        console.log(req.body)

    Model.getModelPersonneComplete().create(req.body);

    return responseBuilder(res,  "200",  "Requette réussie", null)

    })
    
    
    

})

app.get("/films", async(req, res) => {
    //
    // Select all avec mongodb
    const films = await Model.getModelFilm().find()

    //console.log(films)
 
    return responseBuilder(res,  "200",  "Requette réussie", films)
})

app.get("/film/:id", async (req, res) => {
    /*
        #swagger.description = 'Récupérer un film grace a id'
     */
    const idRequest = parseInt(req.params.id);

    const film = await Model.getModelFilm().findOne({id : idRequest})
 
    return responseBuilder(res,  "200",  "Requette réussie", film)
});


app.post("/film/create", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Creer un film'
     */

    const response = await Model.getModelFilm().create(req.body)

    return responseBuilder(res,  "200",  "Requette réussie", null)

});

app.post("/film/update/:id", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Mettre a jour un film'
     */

    console.log(req.body)

    const response = await Model.getModelFilm().updateOne({"id" : req.body.id} , req.body)

    if(response.modifiedCount == 1)
    {
        return responseBuilder(res,  "200",  "Requette réussie", null)
    }
    else
    {
        return responseBuilder(res,  "403",  "Requette echouée", null)
    }

    

    

});

app.post("/film/delete/:id", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Supprimer un film
     */

    await Model.getModelFilm().deleteOne({"id" : req.params.id})


    return responseBuilder(res,  "200",  "Requette réussie", null)

});



// Lancer le server

app.listen(3000, () => {
    console.log("Serveur démarré");
});