// const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");
// const TrackModel = require("../models/TrackModel");
// const TrackMetadataModel = require("../models/TrackMetadataModel");
const CombinedDataService = require('../services/CombinedDataService');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour
const cacheDisregarded = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour


module.exports.getFuzzyLevenshtein = async (req, res) => {
  console.log("---- getFuzzyLevenshtein ---- req.query: ", req.query);
  const { stringNotes, percMatch, user, textFilterArtist, textFilterTrack, textFilterRecording } = req.query;
  let notes = stringNotes;
  const notes_int = notes.split('-').map(a => Number(a));
  let distance = notes_int.length;

  console.log(">>> Searching if specific search exists");
  let matchSearchMap = await CombinedDataService.getSearchMap(stringNotes, textFilterArtist, textFilterRecording, textFilterTrack, percMatch);
  if (matchSearchMap.length > 0) {
    console.log("matchSearchMap[0]._id: ", matchSearchMap[0]._id, ", matchSearchMap[0].query: ", matchSearchMap[0].query);
    res.send(matchSearchMap[0].levenshteinScores);
  } else {
    console.log("Need to make the search");
    // - Get the score based on input
    let score = CombinedDataService.map_to_fuzzy_score(
      CombinedDataService.calculateIntervalSum(notes_int)
    );
    console.log("notes: ", notes, ", distance: ", distance, ", score: ", score, ", textFilterArtist: ", textFilterArtist, ", textFilterTrack: ", textFilterTrack, ", textFilterRecording: ", textFilterRecording);
    console.log("Time: ", new Date());
    try {
      let lognumbersFilter = [];
      let sjaIdsFilter = [];
      let tracktitlesFilter = [];
      let objsMetadata = [];
      // - Prepare the arrays and code queries to get match track to filter
      if (textFilterArtist !== '' || textFilterTrack !== '' || textFilterRecording !== '') {
        let attributeValueArray = [], attributeNameArray = [];
        if (textFilterArtist !== '') { attributeValueArray.push('artist'); attributeNameArray.push(textFilterArtist); }
        if (textFilterTrack !== '') { attributeValueArray.push('track'); attributeNameArray.push(textFilterTrack); }
        if (textFilterRecording !== '') { attributeValueArray.push('recording'); attributeNameArray.push(textFilterRecording); }
        objsMetadata = await CombinedDataService.getMetadataFromAttributes(attributeValueArray, attributeNameArray);
        lognumbersFilter = [...new Set(objsMetadata.map(a => a.lognumber))];
        sjaIdsFilter = [...new Set(objsMetadata.map(a => '' + a._doc['SJA ID']))];
        tracktitlesFilter = [...new Set(objsMetadata.map(a => a['Track Title']))];
      }

      // TODO still SLOW (but a bit better with applied filter)
      let fuzzyScores = await CombinedDataService.getFuzzyScores(score, distance, lognumbersFilter);

      // Now fuzzyScores will contain the resolved data
      console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length); // Manually checked without filter and it is fine
      console.log("Time: ", new Date());
      // - Filter the results for tracks if there are filters set by user
      if (textFilterTrack !== "") {
        let lognumbersFromFuzzy = [...new Set(fuzzyScores.map((a) => a["lognumber"])),];
        console.log("lognumbersFromFuzzy, ", lognumbersFromFuzzy);
        // for (var i in lognumbersFromFuzzy) { console.log("lognumbersFromFuzzy[i] ", lognumbersFromFuzzy[i], " in lognumbersFilter: ", lognumbersFilter.includes(lognumbersFromFuzzy[i])); }
        let matchessjaIdsFromFuzzy = [];
        let sjaIdsFromFuzzy = [...new Set(fuzzyScores.map((a) => "" + a["SJA ID"])),];
        for (var i in sjaIdsFromFuzzy) {
          // console.log("sjaIdsFromFuzzy[", i, "] ", sjaIdsFromFuzzy[i], " in sjaIdsFilter: ", sjaIdsFilter.join().includes("" + sjaIdsFromFuzzy[i]));
          if (sjaIdsFilter.join().includes("" + sjaIdsFromFuzzy[i])) {
            matchessjaIdsFromFuzzy.push(sjaIdsFromFuzzy[i]);
          }
        }

        console.log("size before filtering based on SJA ID. ", fuzzyScores.length);
        fuzzyScores = fuzzyScores.filter((item) => matchessjaIdsFromFuzzy.includes(item["SJA ID"]));
        console.log("size after filtering based on SJA ID. ", fuzzyScores.length);
      }

      let arrIds = fuzzyScores.map(a => a.first_id);
      console.log("arrIds.length: ", arrIds.length);

      const dataTrack = await CombinedDataService.getTracksFromFirstId(arrIds);
      dataTrack ? console.log("dataTrack.length: ", dataTrack.length) : console.log("dataTrack undefined!");
      // dataTrack has the same length as fuzzyScores without filters

      // TODO Still kind of slow. Assess if it can be enhanced.
      let arrTracksMelodies = await CombinedDataService.getMelodiesFromFuzzyScores(fuzzyScores, distance);
      arrTracksMelodies ? console.log("arrTracksMelodies.length: ", arrTracksMelodies.length) : console.log("arrTracksMelodies undefined!");
      console.log("Time: ", new Date());
      console.log("arrTracksMelodies[0]: ", arrTracksMelodies[0]);

      let filteredMelodies = arrTracksMelodies.filter(a => (typeof a) !== 'undefined');
      console.log("filteredMelodies.length: ", filteredMelodies.length);

      // Modulo is now 0
      let numMelodies = arrTracksMelodies.length / distance;
      console.log("numMelodies: ", numMelodies);
      console.log("Time: ", new Date());

      // Calculate Levenshtein distances for non-overlapping sections of arrTracksMelodies with caching
      // TODO check the issue with the local caching not often (never?!) reinforced
      const levenshteinScores = [];
      let numberCacheMatch = 0, numCacheDisregarded = 0;
      const sectionLength = parseInt(distance); // Convert distance to an integer if it's a string

      for (let i = 0; i <= arrTracksMelodies.length - sectionLength; i += sectionLength) {
        const sectionNotesObj = arrTracksMelodies.slice(i, i + sectionLength);
        const cacheKey = `levenshtein:${stringNotes}:${sectionNotesObj.map(a => a.pitch).join("-")}_${percMatch}_${textFilterArtist}_${textFilterRecording}_${textFilterTrack}`;
        const cachedResult = cache.get(cacheKey);

        if (cachedResult) {
          numberCacheMatch++;
          levenshteinScores.push({
            sectionIndex: i,
            levenshteinDistance: cachedResult,
            track: arrTracksMelodies[i].track,
            sja_id: sectionNotesObj[0]['SJA ID'] ? sectionNotesObj[0]['SJA ID'] : null,
            lognumber: arrTracksMelodies[i].lognumber,
            first_m_id: arrTracksMelodies[i].m_id,
            notes: sectionNotesObj.map(a => a.pitch),
            durations: sectionNotesObj.map(a => a.duration),
            onsets: sectionNotesObj.map(a => a.onset),
            m_ids: sectionNotesObj.map(a => a.m_id),
            _ids: sectionNotesObj.map(a => a._id),
          });
        } else {
          const levenshteinDistance =
            CombinedDataService.calcLevenshteinDistance_int_optimistic(sectionNotesObj.map((a) => a.pitch), notes_int);
          const dissimilarityPercentage = levenshteinDistance / notes_int.length;

          if (dissimilarityPercentage <= 1 - percMatch) {
            // console.log("We passed something. dissimilarityPercentage: ",dissimilarityPercentage,", with filters ",{textFilterArtist, textFilterTrack, textFilterRecording});
            cache.set(cacheKey, levenshteinDistance);
            levenshteinScores.push({
              sectionIndex: i,
              levenshteinDistance: levenshteinDistance,
              track: arrTracksMelodies[i].track,
              sja_id: sectionNotesObj[0]["SJA ID"] ? sectionNotesObj[0]["SJA ID"] : null,
              lognumber: arrTracksMelodies[i].lognumber,
              first_m_id: arrTracksMelodies[i].m_id,
              notes: sectionNotesObj.map((a) => a.pitch),
              durations: sectionNotesObj.map((a) => a.duration),
              onsets: sectionNotesObj.map((a) => a.onset),
              m_ids: sectionNotesObj.map((a) => a.m_id),
              _ids: sectionNotesObj.map((a) => a._id),
            });
          } else {
            cacheDisregarded.set(cacheKey, levenshteinDistance);
            numCacheDisregarded++;
          }
        }
      }
      console.log("~~~ numberCacheMatch: ", numberCacheMatch, ", numCacheDisregarded: ", numCacheDisregarded, ", length of results: ", levenshteinScores.length);
      console.log("Levenshtein distances calculated. first one: ", levenshteinScores[0]);
      console.log("Time: ", new Date());

      // Saving the result. Parameters: stringNotes, textFilterArtist, textFilterTrack, textFilterRecording, percMatch
      if (!matchSearchMap.length > 0) {
        CombinedDataService.createSearchMap(
          stringNotes, textFilterArtist, textFilterRecording, textFilterTrack, percMatch, levenshteinScores
        );
      }


      res.send(levenshteinScores);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
};
