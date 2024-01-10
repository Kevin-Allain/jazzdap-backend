// const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");
// const TrackModel = require("../models/TrackModel");
// const TrackMetadataModel = require("../models/TrackMetadataModel");
const CombinedDataService = require('../services/CombinedDataService');

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour
const cacheDisregarded = new NodeCache({ stdTTL: 60 * 60 }); // Cache with a TTL of 1 hour


module.exports.getFuzzyLevenshtein = async (req, res) => {
  console.log("---- getFuzzyLevenshtein ---- req.query: ", req.query);
  const { stringNotes, percMatch, user,
    textFilterArtist,
    textFilterTrack,
    textFilterRecording,
    textFilterLocations,
    textFilterProducers,
    startYear, endYear } = req.query;
  let notes = stringNotes;
  const notes_int = notes.split('-').map(a => Number(a));
  let distance = notes_int.length;

  console.log(">>> Searching if specific search exists");
  let matchSearchMap = await CombinedDataService
    .getSearchMap(stringNotes, textFilterArtist, textFilterRecording, textFilterTrack, textFilterLocations, textFilterProducers, startYear, endYear, percMatch);
  if (matchSearchMap.length > 0) {
    console.log("matchSearchMap[0]._id: ", matchSearchMap[0]._id, ", matchSearchMap[0].query: ", matchSearchMap[0].query);
    res.send(matchSearchMap[0].levenshteinScores);
  } else {
    console.log("Need to make the search");
    // - Get the score based on input
    let score = CombinedDataService.map_to_fuzzy_score(
      CombinedDataService.calculateIntervalSum(notes_int)
    );
    console.log("notes: ", notes,", distance: ", distance, ", score: ", score, ", textFilterArtist: ", textFilterArtist, ", textFilterTrack: ", textFilterTrack, ", textFilterRecording: ", textFilterRecording,", textFilterLocations: ",textFilterLocations,", textFilterProducers: ",textFilterProducers);
    console.log("Time: ", new Date());
    try {
      let lognumbersFilter = [];
      let sjaIdsFilter = [];
      let tracktitlesFilter = [];
      let objsMetadata = [];
      console.log("startYear: ",startYear,", endYear: ",endYear,", (startYear !=='' && endYear !==''): ",(startYear !=='' && endYear !==''));
      // - Prepare the arrays and code queries to get match track to filter
      if (textFilterArtist !== '' || textFilterTrack !== '' || textFilterRecording !== ''
        || textFilterLocations !=='' || textFilterProducers !=='' || (startYear !=='' && endYear !=='')
      ) {
        let attributeValueArray = [], attributeNameArray = [];
        if (textFilterArtist !== '') { attributeValueArray.push('artist'); attributeNameArray.push(textFilterArtist); }
        if (textFilterTrack !== '') { attributeValueArray.push('track'); attributeNameArray.push(textFilterTrack); }
        if (textFilterRecording !== '') { attributeValueArray.push('recording'); attributeNameArray.push(textFilterRecording); }
        if (textFilterLocations !== '') { attributeValueArray.push('location'); attributeNameArray.push(textFilterLocations); } 
        if (textFilterProducers !== '') { attributeValueArray.push('producer'); attributeNameArray.push(textFilterProducers); }
        if (startYear !== '') { attributeValueArray.push('startYear'); attributeNameArray.push(startYear); }
        if (endYear !== '') { attributeValueArray.push('endYear'); attributeNameArray.push(endYear); }

        objsMetadata = await CombinedDataService
          .getMetadataFromAttributes(attributeValueArray, attributeNameArray);
        lognumbersFilter = [...new Set(objsMetadata.map(a => a.lognumber))];
        sjaIdsFilter = [...new Set(objsMetadata.map(a => '' + a._doc['SJA_ID']))];
        tracktitlesFilter = [...new Set(objsMetadata.map(a => a['Track Title']))];
      }

      // TODO still SLOW (but a bit better with applied filter)
      // Christmas Critical WIP
      let fuzzyScores = await CombinedDataService
        .getFuzzyScores(score, distance, lognumbersFilter);

      // Now fuzzyScores will contain the resolved data
      console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length); // Manually checked without filter and it is fine
      console.log("fuzzyScores[0]: ",fuzzyScores[0]);
      console.log("Time: ", new Date());
      // - Filter the results for tracks if there are filters set by user
      if (textFilterTrack !== "") {
        let lognumbersFromFuzzy = [...new Set(fuzzyScores.map((a) => a["lognumber"])),];
        // console.log("lognumbersFromFuzzy, ", lognumbersFromFuzzy);
        // for (var i in lognumbersFromFuzzy) { console.log("lognumbersFromFuzzy[i] ", lognumbersFromFuzzy[i], " in lognumbersFilter: ", lognumbersFilter.includes(lognumbersFromFuzzy[i])); }
        let matchessjaIdsFromFuzzy = [];
        let sjaIdsFromFuzzy = [...new Set(fuzzyScores.map((a) => "" + a["SJA_ID"])),];
        for (var i in sjaIdsFromFuzzy) {
          // console.log("sjaIdsFromFuzzy[", i, "] ", sjaIdsFromFuzzy[i], " in sjaIdsFilter: ", sjaIdsFilter.join().includes("" + sjaIdsFromFuzzy[i]));
          if (sjaIdsFilter.join().includes("" + sjaIdsFromFuzzy[i])) {
            matchessjaIdsFromFuzzy.push(sjaIdsFromFuzzy[i]);
          }
        }
        console.log("size before filtering based on SJA_ID. ", fuzzyScores.length);
        fuzzyScores = fuzzyScores.filter((item) => matchessjaIdsFromFuzzy.includes(item["SJA_ID"]));
        console.log("size after filtering based on SJA_ID. ", fuzzyScores.length);
      }
      let arrIds = fuzzyScores.map(a => a.first_id);
      console.log("arrIds.length: ", arrIds.length);

      // Christmas Critical WIP
      const dataTrack = await CombinedDataService
        .getTracks_From_ArrayIds(arrIds);
      dataTrack ? console.log("dataTrack.length: ", dataTrack.length) : console.log("dataTrack undefined!");
      // dataTrack has the same length as fuzzyScores without filters

      // TODO Still kind of slow. Assess if it can be enhanced.
      let arrTracksMelodies = await CombinedDataService
        .getMelodiesFromFuzzyScores(fuzzyScores, distance);
      arrTracksMelodies ? console.log("arrTracksMelodies.length: ", arrTracksMelodies.length) : console.log("arrTracksMelodies undefined!");

      // Modulo is now 0 -> NOT ALWAYS!!! Is it the selection that is messed up? 
      let numMelodies = arrTracksMelodies.length / distance;
      console.log("numMelodies: ", numMelodies);

      // Calculate Levenshtein distances for non-overlapping sections of arrTracksMelodies with caching
      // TODO check the issue with the local caching not often (never?!) reinforced
      const levenshteinScores = [];
      let numberCacheMatch = 0, numCacheDisregarded = 0;
      const sectionLength = parseInt(distance); // Convert distance to an integer if it's a string

      for (let i = 0; i <= arrTracksMelodies.length - sectionLength; i += sectionLength) {
        const sectionNotesObj = arrTracksMelodies.slice(i, i + sectionLength);
        
        // For more filters
        const cacheKey = `levenshtein:${stringNotes}:${sectionNotesObj.map(a => a.pitch).join("-")}_${percMatch}_${textFilterArtist}_${textFilterRecording}_${textFilterTrack}_${textFilterLocations}_${textFilterProducers}_${startYear}_${endYear}`;
        const cachedResult = cache.get(cacheKey);

        if (cachedResult) {
          numberCacheMatch++;
          levenshteinScores.push({
            sectionIndex: i,
            levenshteinDistance: cachedResult,
            track: arrTracksMelodies[i].track,
            sja_id: sectionNotesObj[0]['SJA_ID'] ? sectionNotesObj[0]['SJA_ID'] : null,
            lognumber: arrTracksMelodies[i].lognumber,
            first_m_id: arrTracksMelodies[i].m_id,
            notes: sectionNotesObj.map(a => a.pitch),
            durations: sectionNotesObj.map(a => a.duration),
            onsets: sectionNotesObj.map(a => a.onset),
            m_ids: sectionNotesObj.map(a => a.m_id),
            _ids: sectionNotesObj.map(a => a._id),
          });
        } else {
          // Christmas critical WIP
          const levenshteinDistance =
            CombinedDataService
              .calcLevenshteinDistance_int_optimistic(sectionNotesObj.map((a) => a.pitch), notes_int);
          const dissimilarityPercentage = levenshteinDistance / notes_int.length;
          if (i <= 2*sectionLength) {
            console.log("i: ", i, ", levenshteinDistance: ", levenshteinDistance, ", dissimilarityPercentage: ", dissimilarityPercentage, ", notes_int.length: ", notes_int.length)
            console.log("sectionNotesObj.map((a) => a.pitch).toString(): ",sectionNotesObj.map((a) => a.pitch).toString(),", notes_int.toString(): ",notes_int.toString());
          }
          // if (sectionNotesObj[0].pitch === notes_int[0]){
          //   console.log("~ could match? ");
          //   console.log("sectionNotesObj.map((a) => a.pitch).toString(): ",sectionNotesObj.map((a) => a.pitch).toString(),", notes_int.toString(): ",notes_int.toString());
          //   console.log("sectionNotesObj[0]: ",sectionNotesObj[0]);
          // }
          if (sectionNotesObj[0]._id.toHexString() === "650c4318a5bcafb5915fe6a1"){
            console.log("~ should match? ");
            console.log("sectionNotesObj.map((a) => a.pitch).toString(): ",sectionNotesObj.map((a) => a.pitch).toString(),", notes_int.toString(): ",notes_int.toString());
            console.log("sectionNotesObj[0]: ",sectionNotesObj[0]);
          }
          if (sectionNotesObj.map((a) => a.pitch).toString() === notes_int.toString()) {
            console.log("THIS SHOULD HAPPEN - matching perfectly. i: ", i);
          }

          if (dissimilarityPercentage <= 1 - percMatch) {
            // console.log("We passed something. dissimilarityPercentage: ",dissimilarityPercentage,", with filters ",{textFilterArtist, textFilterTrack, textFilterRecording});
            cache.set(cacheKey, levenshteinDistance);
            levenshteinScores.push({
              sectionIndex: i,
              levenshteinDistance: levenshteinDistance,
              track: arrTracksMelodies[i].track,
              sja_id: sectionNotesObj[0]["SJA_ID"] ? sectionNotesObj[0]["SJA_ID"] : null,
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
          stringNotes, 
          textFilterArtist, 
          textFilterRecording, 
          textFilterTrack, 
          textFilterLocations,
          textFilterProducers, 
          startYear,endYear,
          percMatch, 
          levenshteinScores
        );
      }
      res.send(levenshteinScores);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
};
