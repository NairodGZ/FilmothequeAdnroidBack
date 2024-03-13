const express = require('express')
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")

const secretJwtKey = 'dorian'

// ======================== BDD ==========================//

// Preparer un model (une classe Personne)
const Personne = mongoose.model('Personne', {id : Number, email : String, pseudo : String}, "personne");
const PersonneComplete = mongoose.model('PersonneComplete', { email : String, pseudo : String, motDePasse : String, codePostal : String, ville : String, numero : String}, "personne");
const Film = mongoose.model("Film", {id : Number, title : String , synopsis : String, duration : String , year : String}, "film")

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
function tokenVerify(req, res, next)
{
    const token = req.headers['authorization']

    // Problème 1 pas de token
    if(!token)
    {
        return res.status(403).json({message : "Token non fourni"})
    }

    // Problème 2 : token non valide
    jwt.verify(token, secretJwtKey, (err, decoded) =>{
        
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

app.post("/verify-token", async(req, res) => {

    const token = req.headers['authorization']

    // Problème 1 pas de token
    if(!token)
    {
        return res.json({"code" : "403", "message" : "Token invalide"})
    }

    // Problème 2 : token non valide
    jwt.verify(token, secretJwtKey, (err, decoded) =>{
        
        // Si erreur
        if(err)
        {
            return res.json({"code" : "403", "message" : "Token invalide"})
        }

        return res.json({"code" : "200", "message" : "Token valide", "data" :true})

    })

})


app.post("/login", async(req, res) => {

    console.log(req.body)

    const personneQuery = await PersonneComplete.findOne({"email" : req.body.email})

    console.log(personneQuery)

    if(personneQuery)
    {
        bcrypt.compare(req.body.motDePasse, personneQuery.motDePasse, function(err, result) {
        if (result) {
            
            const token = jwt.sign({mail : req.body.email}, secretJwtKey, {expiresIn : '1h'})

            res.json( {code : "200", message : "Connection réussie", data : token});

        }
        else
        {
            res.json({code : "403", message : "Données invalides"})
        }
    });
    }

    

    

})


app.get("/persons", async(req, res) => {
    //
    // Select all avec mongodb
    const personnes = await Personne.find()
 
    res.json(personnes);
})


app.get("/persons/:id", async (req, res) => {
    /*
        #swagger.description = 'Récupérer une personne grace a id'
     */
    const idRequest = parseInt(req.params.id);

    const personne = await Personne.findOne({id : idRequest})
 
    res.json(personne);
});

app.post("/persons/create", async(req, res) => {

    console.log(req.body)

     bcrypt.hash(req.body.motDePasse, 10).then((hash) => {
        // Remplacer le mot de passe original par le hash
        req.body.motDePasse = hash;

        console.log(req.body)

    PersonneComplete.create(req.body);

    res.json({code : "200", message : "Requette réussie"} );

    })
    
    
    

})

app.get("/films", async(req, res) => {
    //
    // Select all avec mongodb
    const films = await Film.find()

    //console.log(films)
 
    res.json({code : "200", message : "Requette réussie", data : films} );
})

app.get("/film/:id", async (req, res) => {
    /*
        #swagger.description = 'Récupérer un film grace a id'
     */
    const idRequest = parseInt(req.params.id);

    const film = await Film.findOne({id : idRequest})
 
    res.json({code : "200", message : "Requette réussie", data : film} );
});


app.post("/film/create", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Creer un film'
     */

    await Film.create(req.body)

    res.json({code : "200", message : "Requette réussie"} );

});

app.post("/film/update/:id", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Mettre a jour un film'
     */

        console.log(req.body)

    await Film.updateOne({"id" : req.body.id} , req.body)

    res.json({code : "200", message : "Requette réussie"} );

    

});

app.post("/film/delete/:id", tokenVerify, async (req, res) => {
    /*
        #swagger.description = 'Supprimer un film
     */

    await Film.deleteOne({"id" : req.params.id})


    res.json({code : "200", message : "Requette réussie"} );

});



// Lancer le server

app.listen(3000, () => {
    console.log("Serveur démarré");
});