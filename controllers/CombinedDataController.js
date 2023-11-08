// const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");
// const TrackModel = require("../models/TrackModel");
// const TrackMetadataModel = require("../models/TrackMetadataModel");
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
      let lognumbersFilter = [];
      let objsMetadata = [];
      if (textFilterArtist!=='' || textFilterTrack!=='' || textFilterRecording!==''){
        // 0 - Prepare the arrays
        // TODO not working with track title yet...
        let attributeValueArray = [], attributeNameArray = [];
        if(textFilterArtist!==''){attributeValueArray.push('artist');attributeNameArray.push(textFilterArtist);}
        if(textFilterTrack!==''){attributeValueArray.push('track');attributeNameArray.push(textFilterTrack);}
        if(textFilterRecording!==''){attributeValueArray.push('recording');attributeNameArray.push(textFilterRecording);}
        // 1 - Code queries to get match track to filter
        objsMetadata = await CombinedDataService.getMetadataFromAttributes( attributeValueArray, attributeNameArray );
        console.log("objsMetadata.length: ",objsMetadata.length);
        lognumbersFilter = [...new Set(objsMetadata.map(a => a.lognumber))];
      }

      // TODO still SLOW
      let fuzzyScores = await CombinedDataService.getFuzzyScores(score, distance, lognumbersFilter);
      
      // Now fuzzyScores will contain the resolved data
      console.log("Got the fuzzyScores. Its length: ", fuzzyScores.length);
      console.log("Time: ",new Date());
      console.log("Middle item is: ", fuzzyScores[ Math.round(fuzzyScores.length/2) ]);
      // filter the results if there are filters set by user
      if (textFilterArtist!=='' || textFilterTrack!=='' || textFilterRecording!==''){
        // 2.1 - Apply filter over fuzzyScores object, based on matching lognumber (one lognumber can have several event names, artists names, etc.)
        // let prevSizeFuzzyScore = fuzzyScores.length; 
        // fuzzyScores = fuzzyScores.filter((item) => lognumbers.includes(item.lognumber) );
        // let nextSizeFuzzyScore = fuzzyScores.length;
        // console.log("fuzzyScores went from ",prevSizeFuzzyScore,", to ", nextSizeFuzzyScore); // TODO this is a big difference, indicating we might speed up first request by filtering based on lognumbers first.

        // 2.2 - Apply second filter by matching the sja id if the track filter is on
        if (textFilterTrack !== '') {
          // TODO we should check with all the objsMetadata, not only the first one. There can be several items with the track matching
          console.log("objsMetadata[0]: ",objsMetadata[0],", typeof objsMetadata[0]: ",objsMetadata[0],", lenght: ",objsMetadata.length);
          objsMetadata = objsMetadata.filter(a => a._doc['Track Title']===textFilterTrack);
          console.log("objsMetadata lenght post filter: ",objsMetadata.length);
          // let parsedObj = JSON.parse(objsMetadata[0]);
          let keysMetadata = Object.keys(objsMetadata);
          console.log("keysMetadata: ",keysMetadata)
          let keysMetadata0 = Object.keys(objsMetadata[0]);
          console.log("keysMetadata0: ",keysMetadata0)
          console.log("---")
          console.log("objsMetadata[0]._doc: ",objsMetadata[0]._doc);
          console.log("objsMetadata[0]._doc['SJA ID']: ",objsMetadata[0]._doc['SJA ID'],", objsMetadata[0]._doc['Track Title']: ", objsMetadata[0]._doc['Track Title']);
          let sja_id = objsMetadata[0]._doc['SJA ID'];
          console.log("sja_id: ",sja_id);
          console.log("---")
          // let keysParsed = Object.keys(parsedObj);
          // console.log("keysParsed: ",keysParsed)
          // console.log("parsedObj: ",parsedObj);
          console.log("first fuzzy keys score: ", Object.keys(fuzzyScores[0]));
          console.log("and the firstobject fuzzyScores: ",fuzzyScores[0],", its sja id: ",fuzzyScores[0]['SJA ID']);
          let allSjaIds = [...new Set(fuzzyScores.map(a=> a['SJA ID']))];
          console.log("allSjaIds: ",allSjaIds,", and does it include the other one: ", allSjaIds.includes(sja_id));

          console.log("size before filtering based on SJA ID. ",fuzzyScores.length);
          fuzzyScores = fuzzyScores.filter((item) => sja_id === item['SJA ID']); // TODO issue here?
          // fuzzyScores = fuzzyScores.filter((item) => allSjaIds.includes(item._doc['SJA ID'])); // TODO check fix
          console.log("size after filtering based on SJA ID. ", fuzzyScores.length);
        }
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
      // TODO MASSIVE ISSUE?!
      const levenshteinScores = [];
      let numberCacheMatch = 0, numCacheDisregarded=0;
      const sectionLength = parseInt(distance); // Convert distance to an integer if it's a string
      console.log("sectionLength: ",sectionLength);
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
              console.log("i:",i,". sectionNotesObj.length: ",sectionNotesObj.length
              ," ,sectionNotesObj.map(a => a.lognumber): ",sectionNotesObj.map(a => a.lognumber)
              ," ,sectionNotesObj.map(a => a['SJA ID']): ",sectionNotesObj.map(a => a['SJA ID'])
              ," ,sectionNotesObj.map(a => a.pitch): ",sectionNotesObj.map(a => a.pitch)," ,notes_int: ",notes_int)
              console.log("sectionNotesObj['SJA ID']: ",sectionNotesObj['SJA ID']); // Undefined... seems wrong
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
            const dissimilarityPercentage =
              levenshteinDistance / notes_int.length;

            if ( i%sectionLength === 0 && i>1220 &&i<1240 ){              
              console.log("levenshteinDistance: ",levenshteinDistance,",dissimilarityPercentage: ",dissimilarityPercentage,", passed threshold: ",(dissimilarityPercentage <= 1-percMatch));
            }
            
            if (dissimilarityPercentage <= 1-percMatch) {
              console.log("We passed something. dissimilarityPercentage: ",dissimilarityPercentage);
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
              numCacheDisregarded++;
            }
          }
        }
        console.log("~~~ numberCacheMatch: ",numberCacheMatch,", numCacheDisregarded: ",numCacheDisregarded);
        console.log("Levenshtein distances calculated. first one: ", levenshteinScores[0]);
        console.log("Time: ",new Date());

        res.send(levenshteinScores);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
