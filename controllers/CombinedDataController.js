const Fuzzy_scoreModel = require("../models/fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");
const CombinedDataService = require('../services/CombinedDataService');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour

module.exports.getFuzzyLevenshtein = async (req, res) => {
    console.log("---- getFuzzyLevenshtein ---- req.query: ", req.query);
    const { score, distance, notes } = req.query;
    console.log("Time: ",new Date());
    try {
        let fuzzyScores = await CombinedDataService.getFuzzyScores(score, distance);

        // Now fuzzyScores will contain the resolved data
        console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length);
        console.log("First item is: ", fuzzyScores[0]);
        let arrIds = fuzzyScores.map(a => a.first_id);
        console.log("arrIds.length: ", arrIds.length);
        console.log("1: get data matching first_id");
        // TODO fix
        // TODO should we make a query to get all the matches in the track database first?
        const dataTrack = await CombinedDataService.getTracksFromFirstId(arrIds);

        dataTrack ? console.log("dataTrack.length: ", dataTrack.length)
            : console.log("dataTrack undefined!")
        console.log("dataTrack[0]: ",dataTrack[0]);
        
        let arrTracksMelodies = await getMelodiesFromTrackId(dataTrack,distance);
        dataTrack ? console.log("arrTracksMelodies.length: ", arrTracksMelodies.length)
            : console.log("arrTracksMelodies undefined!")
        console.log("arrTracksMelodies[0]: ",arrTracksMelodies[0]);

        let numMelodies = arrTracksMelodies.length/distance;
        console.log("numMelodies: ",numMelodies);

        // TODO
        console.log("2: make the Levenshtein distance calculation between arrTracksMelodies and notes");
        console.log("Time: ",new Date());

        // Calculate Levenshtein distances for all sections of arrTracksMelodies with caching
        const levenshteinScores = await Promise.all(arrTracksMelodies.map(async (melody, index) => {
            const cacheKey = `levenshtein:${melody._id}:${notes}`;
            const cachedResult = cache.get(cacheKey);
            if (cachedResult) {
                return { sectionIndex: index, levenshteinDistance: cachedResult };
            } else {
                const melodyNotes = melody.notes.split('-').map(Number);
                const levenshteinDistance = 
                CombinedDataService.calcLevenshteinDistance_int(melodyNotes, notes);
                cache.set(cacheKey, levenshteinDistance);
                return { sectionIndex: index, levenshteinDistance };
            }
        }));

        console.log("Levenshtein distances calculated. first one: ", levenshteinScores[0]);
        console.log("Time: ",new Date());

        res.send("done");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
