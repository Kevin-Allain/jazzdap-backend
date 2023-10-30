const Fuzzy_scoreModel = require("../models/fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");
const TrackMetadataModel = require("../models/TrackMetadataModel");
const CombinedDataService = require('../services/CombinedDataService');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour
const cacheDisregarded = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour


module.exports.getFuzzyLevenshtein = async (req, res) => {
    console.log("---- getFuzzyLevenshtein ---- req.query: ", req.query);
    const { stringNotes, percMatch, user,  textFilterArtist, textFilterTrack, textFilterRecording } = req.query;
    let notes = stringNotes;
    const notes_int = notes.split('-').map(a=>Number(a));
    let distance = notes_int.length;
    let score = CombinedDataService.map_to_fuzzy_score(CombinedDataService.calculateIntervalSum(notes_int))
    console.log("notes: ",notes,", distance: ",distance,", score: ",score,", textFilterArtist: ",textFilterArtist,", textFilterTrack: ",textFilterTrack,", textFilterRecording: ",textFilterRecording);
    console.log("Time: ",new Date());
    try {
        // This is fast enough
        let fuzzyScores = await CombinedDataService.getFuzzyScores(score, distance);
        // Now fuzzyScores will contain the resolved data
        console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length);
        console.log("First item is: ", fuzzyScores[0]);

        if (textFilterArtist!=='' || textFilterTrack!=='' || textFilterRecording!==''){
          console.log("Filters to apply");
          // TODO 
          // 0 - Prepare the arrays // OK
          let attributeValueArray = [], attributeNameArray = [];
          if(textFilterArtist!==''){attributeValueArray.push('artist');attributeNameArray.push(textFilterArtist);}
          if(textFilterTrack!==''){attributeValueArray.push('track');attributeNameArray.push(textFilterTrack);}
          if(textFilterRecording!==''){attributeValueArray.push('recording');attributeNameArray.push(textFilterRecording);}
          console.log("attributeValueArray: ",attributeValueArray,", attributeNameArray: ",attributeNameArray);
          // 1 - Code queries to get match track to filter
          let objsMetadata = await CombinedDataService.getMetadataFromAttributes(attributeValueArray, attributeNameArray);
          objsMetadata ? console.log("objsMetadata[0]: ",objsMetadata[0]) : 'objsMetadata not defined!';
          let lognumbers = [...new Set(objsMetadata.map(a => a.lognumber))];
          console.log("]]]] lognumbers: ",lognumbers,", length: ",lognumbers.length);
          // 2 - Apply filter over fuzzyScores object, based on matching lognumber (one lognumber can have several event names, artists names, etc.)
          // Assuming fuzzyScores is your array of objects and lognumbers is your array of lognumbers
          fuzzyScores = fuzzyScores.filter((item) =>
            lognumbers.includes(item.lognumber)
          );
          console.log("Post filter fuzzyScores length: ",fuzzyScores.length);
        }

        let arrIds = fuzzyScores.map(a => a.first_id);
        console.log("arrIds.length: ", arrIds.length);
        console.log("1: get data matching first_id");
        // TODO should we make a query to get all the matches in the track database first?
        const dataTrack = await
            CombinedDataService.getTracksFromFirstId(arrIds);
        dataTrack ? console.log("dataTrack.length: ", dataTrack.length) : console.log("dataTrack undefined!");
        console.log("dataTrack[0]: ",dataTrack[0]);
        console.log("Time: ",new Date());

        // TODO SLOW!!! Fix (slightly better now, but still should be better! One way could be to directly store the _ids in fuzzyScore structure. (Need to rewrite Python code))
        // Potentially, storing the _id of other objects in the fuzzy_score database could be useful?!
        let arrTracksMelodies = await CombinedDataService.getMelodiesFromTrackId(dataTrack,distance);
        arrTracksMelodies ? console.log("arrTracksMelodies.length: ", arrTracksMelodies.length)
            : console.log("arrTracksMelodies undefined!")
        console.log("Time: ",new Date());
        console.log("arrTracksMelodies[0]: ",arrTracksMelodies[0]);
        console.log("arrTracksMelodies[distance-1]: ",arrTracksMelodies[distance-1]);
        console.log("arrTracksMelodies[distance]: ",arrTracksMelodies[distance]);
        console.log("arrTracksMelodies[distance+1]: ",arrTracksMelodies[distance+1]);
        console.log("arrTracksMelodies[2*distance]: ",arrTracksMelodies[2*distance]);

        // TODO assess whether this is okay...!!!
        // Modulo is not 0?!
        let numMelodies = arrTracksMelodies.length/distance;
        console.log("numMelodies: ",numMelodies);

        console.log("Time: ",new Date());

        // Calculate Levenshtein distances for non-overlapping sections of arrTracksMelodies with caching
        // MASSIVE ISSUE?!
        const levenshteinScores = [];
        let numberCacheMatch = 0;
        const sectionLength = parseInt(distance); // Convert distance to an integer if it's a string
        for (let i = 0; i <= arrTracksMelodies.length - sectionLength; i += sectionLength) {
            const sectionNotesObj = arrTracksMelodies
                .slice(i, i + sectionLength)
                // .map(a => { pitch: a.pitch, duration:a.duration, onset:a.onset  });
                const cacheKey = 
                    `levenshtein:${stringNotes}:${sectionNotesObj.map(a => a.pitch).join(",")}`;
                const cachedResult = cache.get(cacheKey);

            // For testing
            if ( i%sectionLength === 0 && i>1220 &&i<1240 ){
                console.log("------");
                console.log("i:",i,". sectionNotesObj.length: ",sectionNotesObj.length," ,sectionNotesObj.map(a => a.pitch): ",sectionNotesObj.map(a => a.pitch)," ,notes_int: ",notes_int)
                console.log("sectionNotesObj['SJA ID']: ",sectionNotesObj['SJA ID']);
                console.log("cacheKey: ",cacheKey);
                console.log("cache.get(cacheKey): ",cache.get(cacheKey));
                console.log("cacheDisregarded.get(cacheKey): ",cacheDisregarded.get(cacheKey));
            }

            if (cachedResult) {
                numberCacheMatch++;
                levenshteinScores.push({ 
                    sectionIndex: i, 
                    levenshteinDistance: cachedResult,
                    track:arrTracksMelodies[i].track,
                    sja_id: sectionNotesObj[0]['SJA ID']?sectionNotesObj[0]['SJA ID']:null,
                    lognumber:arrTracksMelodies[i].lognumber,
                    first_m_id: arrTracksMelodies[i].m_id,
                    notes: sectionNotesObj.map(a => a.pitch),
                    durations: sectionNotesObj.map(a => a.duration),
                    onsets: sectionNotesObj.map(a => a.onset),
                    m_ids: sectionNotesObj.map(a => a.m_id),
                    _ids: sectionNotesObj.map(a => a._id),
                });
            } else {
              const levenshteinDistance =
                CombinedDataService.calcLevenshteinDistance_int_optimistic(
                  sectionNotesObj.map((a) => a.pitch),
                  notes_int
                );
              const similarityPercentage =
                levenshteinDistance / notes_int.length;
              if (similarityPercentage <= 1-percMatch) {
                cache.set(cacheKey, levenshteinDistance);
                levenshteinScores.push({
                  sectionIndex: i,
                  levenshteinDistance: levenshteinDistance,
                  track: arrTracksMelodies[i].track,
                  sja_id: sectionNotesObj[0]["SJA ID"]
                    ? sectionNotesObj[0]["SJA ID"]
                    : null,
                  lognumber: arrTracksMelodies[i].lognumber,
                  first_m_id: arrTracksMelodies[i].m_id,
                  notes: sectionNotesObj.map((a) => a.pitch),
                  durations: sectionNotesObj.map((a) => a.duration),
                  onsets: sectionNotesObj.map((a) => a.onset),
                  m_ids: sectionNotesObj.map((a) => a.m_id),
                  _ids: sectionNotesObj.map((a) => a._id),
                  // riffLength: sectionNotes.length,
                });
              } else {
                cacheDisregarded.set(cacheKey, levenshteinDistance);
              }
            }
        }
        console.log("~~~ numberCacheMatch: ",numberCacheMatch);
        console.log("Levenshtein distances calculated. first one: ", levenshteinScores[0]);
        console.log("Time: ",new Date());

        res.send(levenshteinScores);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
