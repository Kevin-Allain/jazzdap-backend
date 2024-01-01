const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId;

const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");
const TrackMetadataModel = require("../models/TrackMetadataModel");
const SearchMapModel = require("../models/SearchMapModel");

const calculateIntervalSum=(melody)=> {
  let sum = 0;
  for (let i = 0; i < melody.length - 1; i++) {
    sum += melody[i] - melody[i + 1];
  }
  return sum;
}

const map_to_fuzzy_score=(score)=> {
  if (score < -7) {
    return -4;
  } else if (score >= -7 && score <= -5) {
    return -3;
  } else if (score >= -4 && score <= -3) {
    return -2;
  } else if (score >= -2 && score <= -1) {
    return -1;
  } else if (score === 0) {
    return 0;
  } else if (score >= 1 && score <= 2) {
    return 1;
  } else if (score >= 3 && score <= 4) {
    return 2;
  } else if (score >= 5 && score <= 7) {
    return 3;
  } else {
    return 4;
  }
}

//   const objectId = mongoose.Types.ObjectId(newId);

// Get the next hex _id based on end of its string
// Dirty but faster: limited to 3 strings end of the currentId for calculation
const getNextIdLimited = (currentId, indexDiff) => {
  // console.log(`getNextIdLimited. currentId: ${currentId}, indexDiff: ${indexDiff}`);
  // Convert the hexadecimal end of the string to a base-10 number
  let subStrStart = currentId.substring(0,currentId.length - 3);
  let subStrEnd = currentId.substring(currentId.length - 3);
  let decimalValue = parseInt( subStrEnd, 16);
  decimalValue += indexDiff
  let hexString = ""+decimalValue.toString(16);
  if (hexString.length === 2){hexString = '0'+hexString;}
  if (hexString.length === 1){hexString = '00'+hexString;}
  if (hexString.length === 0){hexString = '000'} // minor doubt about this one
  fullNewHex = subStrStart + hexString

  let indexRecoil = 4;
  while (fullNewHex.length === 25){
    // console.log("fullNewHex.length === 25");
    subStrStart = currentId.substring(0,currentId.length - indexRecoil);
    subStrEnd = currentId.substring(currentId.length - indexRecoil);
    decimalValue = parseInt( subStrEnd, 16);
    decimalValue += indexDiff
    hexString = ""+decimalValue.toString(16);
    fullNewHex = subStrStart + hexString;
    indexRecoil++;
  }

  if (fullNewHex.length!=24){
    console.log("---- Massive issue with: ",fullNewHex);
    console.log("currentId: ",currentId);
    console.log("subStrStart: ",subStrStart);
    console.log("subStrEnd: ",subStrEnd);
    console.log("currentId.length: ",currentId.length);
    console.log("fullNewHex.length: ",fullNewHex.length);
    console.log("hexString: ",hexString);
    console.log("decimalValue: ",decimalValue);
    console.log("indexDiff: ",indexDiff,", typeof indexDiff: ",typeof indexDiff);
  }
  return fullNewHex;

  // Convert the full new hex string to ObjectId
  // const objectId = mongoose.Types.ObjectId(fullNewHex);
  // const objectId = mongoose.Types.ObjectId.createFromHexString(fullNewHex);
  // return objectId;  
}

// This one might be useless
const characterizeFuzzyScore=(fuzzyContourInput)=>{
  let characterizationInput = null;
  if (fuzzyContourInput <= -4) {
    characterizationInput = "big jump down";
  } else if (fuzzyContourInput === -3) {
    characterizationInput = "jump down";
  } else if (fuzzyContourInput === -2) {
    characterizationInput = "leap down";
  } else if (fuzzyContourInput === -1) {
    characterizationInput = "step down";
  } else if (fuzzyContourInput === 0) {
    characterizationInput = "jump down";
  } else if (fuzzyContourInput === 1) {
    characterizationInput = "step up";
  } else if (fuzzyContourInput === 2) {
    characterizationInput = "leap up";
  } else if (fuzzyContourInput === 3) {
    characterizationInput = "jump up";
  } else {
    characterizationInput = "big jump up";
  }
}

const calcLevenshteinDistance_int=(arr1, arr2)=> {
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

const calcLevenshteinDistance_int_relative=(arrInput1, arrInput2)=> {
  let arr1 = arrInput1.map((a) => a - Math.min(...arrInput1));
  let arr2 = arrInput2.map((a) => a - Math.min(...arrInput2));
  const m = arr1.length;
  const n = arr2.length;
  const dp = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (arr1[i - 1] === arr2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

const calcLevenshteinDistance_int_optimistic = (arrInput1, arrInput2) => {
  return Math.min(
    calcLevenshteinDistance_int_relative(arrInput1, arrInput2),
    calcLevenshteinDistance_int(arrInput1, arrInput2)
  );
};

const getFuzzyScores = async (score, distance, lognumbersFilter=[]) => {
  console.log("- Christmas - getFuzzyScores. score: ",score,", distance: ",distance,", lognumbersFilter: ",lognumbersFilter);
  let query = {};
  if (lognumbersFilter.length > 0) {
    query.lognumber = { $in: lognumbersFilter };
  }
  query[`fuzzyRange${distance}`] = score;
  return Fuzzy_scoreModel.find(query)
    .lean()
    .sort({lognumber: 1})
};

const getTracks_From_ArrayIds = async (arrIds) => {
  return TrackModel.find({
    _id: {
      $in: arrIds,
    },
  });
};

const getMelodiesFromTrackId = async (data, lengthSearch) => {
  const batchSize = 100; // Set an appropriate batch size
  const results = [];
  for (let i = 0; i < data.length; i += batchSize) {
    const batchData = data.slice(i, i + batchSize);
    const orQueries = batchData.map(({ track, m_id }) => {
      const minMId = m_id;
      const maxMId = m_id + lengthSearch;
      return {
        track: track,
        m_id: { $gte: minMId, $lte: maxMId },
      };
    });
    const batchResults = await TrackModel.find({ $or: orQueries })
      .sort({ m_id: 1 })
      .lean();
    results.push(...batchResults);
  }
  return results;
};

// TODO make a version without using _idRange: make query to backend to get those idRanges
const getMelodiesFromFuzzyScores = async (fuzzyScores, distance) => {
  console.log( "getMelodiesFromFuzzyScores - fuzzyScores length: ", fuzzyScores.length, ", distance: ", distance );
  console.log("- Christmas - fuzzyScores[0]: ",fuzzyScores[0]);
  let idRanges = [];
  // let indexes_m_id = {};
  const maxRange = 10; // used to be from 1 to 15
  // for (let i in fuzzyScores) {
  //   // indexes_m_id[fuzzyScores[i].first_id] = [];
  //   // CRITICAL CHRISTMAS : getting the _ids of next notes is really important for speed (and maybe then filter them if they don't have same... track?)
  //   // Why do we limit this to start at 4?!
  //   for (let n = 4; n <  Math.min(maxRange,distance+1) ; n++) {
  //     idRanges.push(getNextIdLimited(fuzzyScores[i].first_id, n));
  //     // fuzzyScores[i][`_idRange${n}`]
  //     //   ? fuzzyScores[i][`_idRange${n}`]!==-20
  //     //     ?idRanges.push(fuzzyScores[i][`_idRange${n}`])
  //     //     :null
  //     //   : console.log( "An undefined fuzzyScores[i][`_idRange${n}`]. fuzzyScores[", i, "], with n: ",n," - ", fuzzyScores[i] );
  //   }
  // }
  let allFirstIds = fuzzyScores.map(a => a.first_id);
  console.log("allfirstIds 0 to 10: ",allFirstIds.slice(0,10));
  let mapFirstIdToNext = {};
  let orderedAllIds = [];
  for (let n=0; n <maxRange; n++){
    allFirstIds.map(a => idRanges.push(getNextIdLimited(a, n)) );
    // Trying to see if it works with setting next ids for each first_id
    // TODO test
    allFirstIds.map( a => 
      mapFirstIdToNext[a]
      ? mapFirstIdToNext[a].push(getNextIdLimited(a, n))
      : mapFirstIdToNext[a] = [getNextIdLimited(a, n)]);
  }
  console.log("# idRanges 0 to 10: ",idRanges.slice(0,10));
  for (let i=0; i<10;i++){
    console.log("for ",allFirstIds[i],": ",mapFirstIdToNext[allFirstIds[i]]);
    // So this one is actually fine.
  }
  for(let i in mapFirstIdToNext){
    orderedAllIds.push(...mapFirstIdToNext[i]);
  }
  console.log("idRanges.length: ", idRanges.length);
  console.log("With change: orderedAllIds.length", orderedAllIds.length);
  idRanges = orderedAllIds;
  // // Christmas test
  // // const filteredIdRanges = idRanges.filter(a => a);
  // const filteredIdRanges = trackDocFromFirstIds.filter(a=>a);
  // console.log("~Critical Christmas: For cloud: changed filteredIdRanges. Its length: ",filteredIdRanges.length);

  // Create a set of unique IDs from idRanges
  const uniqueIdRanges = [...new Set(idRanges)];
  console.log("uniqueIdRanges.length: ", uniqueIdRanges.length);
  const filteredUniqueIdRanges = uniqueIdRanges.filter(a => a);
  console.log("filteredUniqueIdRanges.length: ", filteredUniqueIdRanges.length);
  console.log("uniqueIdRanges[0]: ",uniqueIdRanges[0]);

  // // Fetch matching tracks from the database based on unique IDs
  // Convert string representations to ObjectId
  const objectIdRanges = uniqueIdRanges.map(id => new ObjectId(id));
  console.log("objectIdRanges[0]: ",objectIdRanges[0])
  // Fetch matching tracks from the database based on unique IDs
  const matchingTracks = await TrackModel
    .find({ "_id": { "$in": objectIdRanges } });

  // const matchingTracks = await TrackModel
  //   .find({ "_id": { "$in": [...uniqueIdRanges] } });
  console.log("matchingTracks.length: ", matchingTracks.length);
  console.log("matchingTracks[0]: ",matchingTracks[0]);
  // Create a lookup object for matching tracks based on their _id attribute
  const trackLookup = {};
  matchingTracks.forEach(track => {
    trackLookup[track._id.toHexString()] = track;
  });
  console.log("generated trackLookup");

  // Create an array for looking up tracks based on their _id attribute
  const trackLookupArray = Array.from(matchingTracks, 
    track => ({ id: track._id.toHexString(), track })
  );
  console.log("trackLookupArray.length: ",trackLookupArray.length);
  console.log("trackLookupArray[0]: ",trackLookupArray[0]);

  // Map idRanges to the corresponding tracks using the lookup object
  const resultTracks = idRanges.map((idRange) => trackLookup[idRange] );

  console.log("resultTracks.length: ",resultTracks.length);
  // Filter out undefined elements
  const filteredResultTracks = resultTracks.filter(track => track);

  console.log("filteredResultTracks[0]: ",filteredResultTracks[0]);
  console.log("filteredResultTracks.length: ", filteredResultTracks.length);
  return filteredResultTracks;
};



const getMetadataFromAttributes = async (attributeNameArray,attributeValueArray) => {
  // Ensure both arrays have the same length
  if (!Array.isArray(attributeValueArray) || !Array.isArray(attributeNameArray) || attributeValueArray.length !== attributeNameArray.length) { return res.status(400).json({ error: "Invalid input arrays" }); }
  // Mapping attribute values to their replacements
  const attributeNameMap = { 'artist': '(N) Named Artist(s)', 'recording': '(E) Event Name', 'track': 'Track Title' };
  // Replace values in attributeValueArray based on the mapping
  const sanitizedAttributeNameArray = attributeNameArray.map(n => attributeNameMap[n] || n);
  // console.log("sanitizedAttributeNameArray: ",sanitizedAttributeNameArray);
  const queryCondition = {};
  // Construct the query using the sanitized arrays
  sanitizedAttributeNameArray.forEach((attributeName, index) => { 
    queryCondition[attributeName] = { $regex: new RegExp(attributeValueArray[index], 'i') }; 
  });
  
  console.log("queryCondition: ",queryCondition);
  const resultsMeta = await TrackMetadataModel.find(queryCondition)
      // .then(data => { console.log("Searched successfully MusicInfoControllerModel.find"); console.log("data.length: ", data.length,", and first item: ",data[0]); return data;  })
      // .catch(error => { res.status(500).json(error); });
  // console.log("resultsMeta[0]: ",resultsMeta[0])
  return(resultsMeta);
  };

const createSearchMap = async (query, filterArtist, filterRecording, filterTrack, percMatch, levenshteinScores) => {
  console.log("---createSearchMap. ",{query, filterArtist, filterRecording, filterTrack, percMatch});
  // TODO first make a search! THEN if no match, create one
  const data = await SearchMapModel.create({
    query: query,
    filterArtist: filterArtist,
    filterRecording: filterRecording,
    filterTrack: filterTrack,
    percMatch: percMatch,
    levenshteinScores: levenshteinScores
  });
}

const getSearchMap = async( query, filterArtist, filterRecording, filterTrack, percMatch ) => {
  console.log("getSearchMap. ",{query, filterArtist, filterRecording, filterTrack, percMatch});
  let queryRes = { 
    query: query, 
    percMatch: Number(percMatch),
    filterArtist: filterArtist,
    filterRecording:filterRecording,
    filterTrack:filterTrack
  };
  // if (filterArtist !== '') { queryRes.filterArtist = filterArtist }
  // if (filterRecording !== '') { queryRes.filterRecording = filterRecording }
  // if (filterTrack !== '') { queryRes.filterTrack = filterTrack }
  console.log("queryRes: ",queryRes);
  let matchingSearchMap = await SearchMapModel.find(queryRes);
  console.log("matchingSearchMap.length: ",matchingSearchMap.length);
  return matchingSearchMap;
}

module.exports = {
  calcLevenshteinDistance_int,
  calcLevenshteinDistance_int_relative,
  calcLevenshteinDistance_int_optimistic,
  map_to_fuzzy_score,
  calculateIntervalSum,
  getFuzzyScores,
  getTracks_From_ArrayIds,
  getMelodiesFromTrackId,
  getMetadataFromAttributes,
  getMelodiesFromFuzzyScores,
  createSearchMap, getSearchMap
};
