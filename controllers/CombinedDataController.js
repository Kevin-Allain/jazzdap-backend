const Fuzzy_scoreModel = require("../models/fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");
const CombinedDataService = require('../services/CombinedDataService');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour

module.exports.getFuzzyLevenshtein = async (req, res) => {
    console.log("---- getFuzzyLevenshtein ---- req.query: ", req.query);
    const { notes } = req.query;
    const notes_int = notes.split('-').map(a=>Number(a));
    let distance = notes_int.length;
    let score = CombinedDataService.map_to_fuzzy_score(CombinedDataService.calculateIntervalSum(notes_int))
    console.log("notes: ",notes,", distance: ",distance,", score: ",score);
    console.log("Time: ",new Date());
    try {
        // This is fast enough
        let fuzzyScores = await CombinedDataService.getFuzzyScores(score, distance);

        // Now fuzzyScores will contain the resolved data
        console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length);
        console.log("First item is: ", fuzzyScores[0]);
        let arrIds = fuzzyScores.map(a => a.first_id);
        console.log("arrIds.length: ", arrIds.length);
        console.log("1: get data matching first_id");
        // TODO should we make a query to get all the matches in the track database first?
        const dataTrack = await
            CombinedDataService.getTracksFromFirstId(arrIds);

        dataTrack ? console.log("dataTrack.length: ", dataTrack.length)
            : console.log("dataTrack undefined!")
        console.log("dataTrack[0]: ",dataTrack[0]);
        console.log("Time: ",new Date());

        // TODO SLOW!!! Fix (slightly better now)
        let arrTracksMelodies = await getMelodiesFromTrackId(dataTrack,distance);
        arrTracksMelodies ? console.log("arrTracksMelodies.length: ", arrTracksMelodies.length)
            : console.log("arrTracksMelodies undefined!")
        console.log("Time: ",new Date());
        // Order is wrong?!
        console.log("arrTracksMelodies[0]: ",arrTracksMelodies[0]);
        console.log("arrTracksMelodies[distance-1]: ",arrTracksMelodies[distance-1]);
        console.log("arrTracksMelodies[distance]: ",arrTracksMelodies[distance]);
        console.log("arrTracksMelodies[distance+1]: ",arrTracksMelodies[distance+1]);
        console.log("arrTracksMelodies[2*distance]: ",arrTracksMelodies[2*distance]);

        // TODO assess whether this is okay...!
        // Modulo is not 0?!
        let numMelodies = arrTracksMelodies.length/distance;
        console.log("numMelodies: ",numMelodies);

        // TODO
        console.log("2: make the Levenshtein distance calculation between arrTracksMelodies and notes");
        console.log("Time: ",new Date());

        // Calculate Levenshtein distances for non-overlapping sections of arrTracksMelodies with caching
        const levenshteinScores = [];
        const sectionLength = parseInt(distance); // Convert distance to an integer if it's a string
        for (let i = 0; i <= arrTracksMelodies.length - sectionLength; i += sectionLength) {
            const sectionNotes = arrTracksMelodies
                .slice(i, i + sectionLength)
                .map(a => a.pitch);
                const cacheKey = `levenshtein:${sectionNotes.join(",")}:${notes_int.join(",")}`;
                const cachedResult = cache.get(cacheKey);

            if ( i%sectionLength === 0 && i<40 ){
                console.log("------");
                console.log("i:",i,". sectionNotes.length: ",sectionNotes.length," ,sectionNotes: ",sectionNotes," ,notes_int: ",notes_int)
                console.log("cacheKey: ",cacheKey);
                console.log("cache.get(cacheKey): ",cache.get(cacheKey));
            }

            if (cachedResult) {
                levenshteinScores.push({ sectionIndex: i, levenshteinDistance: cachedResult });
            } else {
                const levenshteinDistance = CombinedDataService.calcLevenshteinDistance_int_optimistic(
                    sectionNotes, notes_int
                );
                cache.set(cacheKey, levenshteinDistance);
                levenshteinScores.push({ 
                    sectionIndex: i, 
                    track:arrTracksMelodies[i].track,
                    first_m_id: arrTracksMelodies[i].m_id,
                    notes: sectionNotes,
                    // riffLength: sectionNotes.length,
                    levenshteinDistance,
                    
                });
            }
        }

        console.log("Levenshtein distances calculated. first one: ", levenshteinScores[0]);
        console.log("Time: ",new Date());

        // TODO VERIFY + adapt for the handleApi call to use it quickly
        res.send(levenshteinScores);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
