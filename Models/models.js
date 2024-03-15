
const mongoose = require('mongoose');

const Modele = getModele()


// Preparer un model (une classe Personne)
const Personne = mongoose.model('Personne', {id : Number, email : String, pseudo : String}, "personne");
const PersonneComplete = mongoose.model('PersonneComplete', { email : String, pseudo : String, motDePasse : String, codePostal : String, ville : String, numero : String}, "personne");
const Film = mongoose.model("Film", {id : Number, title : String , synopsis : String, duration : String , year : String}, "film")

function getModele()
{
    function getModelPersonne()
    {
        return Personne
    }


    function getModelPersonneComplete()
    {
        return PersonneComplete
    }

    function getModelFilm()
    {
        return Film
    }

    return {
        getModelPersonne,
        getModelPersonneComplete,
        getModelFilm
    };
}

    


module.exports = Modele