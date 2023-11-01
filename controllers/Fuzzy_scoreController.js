const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");

/**
 * This controller is designed to be called as a filter for other calls searching for melodic similarity. 
 * We intend to pass information that allows for a search in the TrackController to select ranges of track only where the score is equal to input
 * For efficiency purpose, we are considering this controller having a function that makes calls to the TrackController to get Levenshtein Distance after first filter
 */

module.exports.getListFuzzyScores = async (req, res) => {
    console.log("---module.exports.getListFuzzyScores--- req.query:", req.query);
    const { first_id } = req.query;

    Fuzzy_scoreModel.find({first_id:first_id})
    .then( data => {
        console.log("Found data for first_id: ",first_id);
        res.send(data);
    })
    .catch(error => {res.status(500).json(error);});
};

// Other functions: work in progress
// - Search based on fuzzy score for all distances
module.exports.getAllFuzzyScores = async (req, res) => {
    console.log("---module.exports.getAllFuzzyScores---");
    // Get the score from the query parameters
    const { score } = req.query;
    // Define an object to store the matching scores
    let matchingScores = {};
    // Calculate and store matching scores for fuzzyRange1 to fuzzyRange15
    for (let distance = 1; distance <= 15; distance++) {
        // Create the query object with the dynamic property name
        let query = {};
        query[`fuzzyRange${distance}`] = score;
        try {
            // Use await/async for asynchronous operations
            const data = await Fuzzy_scoreModel.find(query);
            // Store the matching score in the result object
            matchingScores[`fuzzyRange${distance}`] = data.length;
        } catch (error) {
            console.error(`Error fetching data for fuzzyRange${distance}:`, error);
            // Handle errors appropriately
            res.status(500).send(error);
            return; // Stop processing further in case of an error
        }
    }
    // Send the matching scores as a JSON response
    res.json(matchingScores);
};

// - Search based on fuzzy score and distance
module.exports.getListFuzzyDist = async (req, res) => {
    console.log("---module.exports.getListFuzzyDist--- req.query:", req.query);
    const { score, distance } = req.query;
    // Create an empty object to store the query parameters
    let query = {};
    // Use a computed property name to set the attribute based on the distance parameter
    query[`fuzzyRange${distance}`] = score;    
    Fuzzy_scoreModel.find(query)
    .then( data => {
        console.log("Found data for getListFuzzyDist");
        res.send(data);
    })
};

