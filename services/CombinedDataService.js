const Fuzzy_scoreModel = require("../models/Fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");
const TrackMetadataModel = require("../models/TrackMetadataModel");

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

// This one might be useless
characterizeFuzzyScore=(fuzzyContourInput)=>{
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

// const getFuzzyScores = async (score, distance, lognumbersFilter=[]) => {
//   let query = {}; query[`fuzzyRange${distance}`] = score;
//   // Return the promise from the find method
//   return Fuzzy_scoreModel.find(query);
// };
const getFuzzyScores = async (score, distance, lognumbersFilter=[]) => {
  console.log("-- getFuzzyScores. score: ",score,", distance: ",distance,", lognumbersFilter: ",lognumbersFilter);
  let query = {};
  if (lognumbersFilter.length > 0) {
    query.lognumber = { $in: lognumbersFilter };
  }
  query[`fuzzyRange${distance}`] = score;
  return Fuzzy_scoreModel.find(query)
    .lean()
    .sort({lognumber: 1})
};

const getTracksFromFirstId = async (arrIds) => {
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

// const getMelodiesFromFuzzyScores = async ( fuzzyScores, distance ) => {
//   console.log("getMelodiesFromFuzzyScores - fuzzyScores length: ",fuzzyScores.length,", distance: ",distance);
//   let idRanges = [];
//   for (var i in fuzzyScores) {
//     for (var n = 0; n < distance; n++) {
//       idRanges.push(fuzzyScores[i][`_idRange${n}`]);
//     }
//   }
//   console.log("idRanges.length: ", idRanges.length);
//   const uniqueIdRanges = [...new Set(idRanges)];
//   console.log("uniqueIdRanges.length: ",uniqueIdRanges.length);
//   const matchingTracks = await TrackModel.find({
//     "_id": { "$in": idRanges }
//   });
//   console.log("matchingTracks.length: ",matchingTracks.length);
//   // TODO make new array where, for each item of idRanges, I make a copy of the matchingTracks item with the matching _id attribute
//   return matchingTracks;
// }

const getMelodiesFromFuzzyScores = async (fuzzyScores, distance) => {
  console.log( "getMelodiesFromFuzzyScores - fuzzyScores length: ", fuzzyScores.length, ", distance: ", distance );
  let idRanges = [];
  for (let i in fuzzyScores) {
    for (let n = 1; n <  distance+1 ; n++) {
      fuzzyScores[i][`_idRange${n}`]
        ? idRanges.push(fuzzyScores[i][`_idRange${n}`])
        : console.log( "An undefined fuzzyScores[i][`_idRange${n}`]. fuzzyScores[", i, "], with n: ",n," - ", fuzzyScores[i] );
    }
  }
  console.log("idRanges.length: ", idRanges.length);
  const filteredIdRanges = idRanges.filter(a => a);
  console.log("filteredIdRanges.length: ",filteredIdRanges.length);

  // Create a set of unique IDs from idRanges
  const uniqueIdRanges = [...new Set(idRanges)];
  console.log("uniqueIdRanges.length: ", uniqueIdRanges.length);
  const filteredUniqueIdRanges = uniqueIdRanges.filter(a => a);
  console.log("filteredUniqueIdRanges.length: ", filteredUniqueIdRanges.length);

  // Fetch matching tracks from the database based on unique IDs
  const matchingTracks = await TrackModel.find({ "_id": { "$in": [...uniqueIdRanges] } });  
  console.log("matchingTracks.length: ", matchingTracks.length);

  // Create a lookup object for matching tracks based on their _id attribute
  const trackLookup = {};
  matchingTracks.forEach(track => {
    trackLookup[track._id.toHexString()] = track;
  });
  console.log("generated trackLookup");

  // Create an array for looking up tracks based on their _id attribute
  const trackLookupArray = Array.from(matchingTracks, track => ({ id: track._id.toHexString(), track }));
  console.log("trackLookupArray.length: ",trackLookupArray.length);
  console.log("trackLookupArray[0]: ",trackLookupArray[0]);

  // Map idRanges to the corresponding tracks using the lookup object
  // const resultTracks = idRanges.map((idRange) =>
  //   trackLookup[idRange]
  //     ? trackLookup[idRange]
  //     : console.log("no match for ", idRange)
  // );
  const resultTracks = idRanges.map((idRange) => trackLookup[idRange] );

  console.log("resultTracks.length: ",resultTracks.length);
  // Filter out undefined elements
  const filteredResultTracks = resultTracks.filter(track => track);


  console.log("filteredResultTracks.length: ", filteredResultTracks.length);
  return filteredResultTracks;
};


// -- approach with a loop (stupid slow)
// const getMelodiesFromFuzzyScores = async (fuzzyScores, distance) => {
//   console.log("getMelodiesFromFuzzyScores - fuzzyScores length: ", fuzzyScores.length, ", distance: ", distance);
//   let idRanges = [];
//   for (let i in fuzzyScores) {
//     for (let n = 0; n < distance; n++) { idRanges.push(fuzzyScores[i][`_idRange${n}`]); }
//   }
//   console.log("idRanges.length: ", idRanges.length);
//   const uniqueIdRanges = [...new Set(idRanges)];
//   console.log("uniqueIdRanges.length: ", uniqueIdRanges.length);
//   const matchingTracks = await TrackModel.find({
//     "_id": { "$in": uniqueIdRanges }
//   });
//   console.log("matchingTracks.length: ", matchingTracks.length);
//   console.log("matchingTracks[0]: ",matchingTracks[0]);
//   console.log("matchingTracks[0]._id: ",matchingTracks[0]._id);
//   console.log("matchingTracks[0]._id.toHexString(): ", matchingTracks[0]._id.toHexString())
//   // Create a new array where each item from idRanges corresponds to a copy of the matching track
//   const resultTracks = [];
//   for (let i = 0; i < idRanges.length; i++) {
//     const idRange = idRanges[i];
//     const objMatch = matchingTracks.filter(track => String(track._id.toHexString()) === String(idRange));
//     if (i <3 ){
//       console.log("idRange: ",idRange);
//       console.log("objMatch: ",objMatch);
//     }
//     if (objMatch) {
//       // resultTracks.push({ ...matchingTrack.toObject() }); // Create a copy of the matching track
//       resultTracks.push(objMatch);
//     }
//     if (i <3 ){
//       console.log("resultTracks[i]: ",resultTracks[i]);
//     }
//     if (i%333===0){
//       console.log(i," out of ",idRanges.length);
//     }
//   }
//   console.log("resultTracks.length: ", resultTracks.length);
//   return resultTracks;
// };




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
  sanitizedAttributeNameArray.forEach((attributeName, index) => { queryCondition[attributeName] = attributeValueArray[index]; });
  // console.log("queryCondition: ",queryCondition);
  const resultsMeta = await TrackMetadataModel.find(queryCondition)
      // .then(data => { console.log("Searched successfully MusicInfoControllerModel.find"); console.log("data.length: ", data.length,", and first item: ",data[0]); return data;  })
      // .catch(error => { res.status(500).json(error); });
  // console.log("resultsMeta[0]: ",resultsMeta[0])
  return(resultsMeta);
  };

module.exports = {
  calcLevenshteinDistance_int,
  calcLevenshteinDistance_int_relative,
  calcLevenshteinDistance_int_optimistic,
  map_to_fuzzy_score,
  calculateIntervalSum,
  getFuzzyScores,
  getTracksFromFirstId,
  getMelodiesFromTrackId,
  getMetadataFromAttributes,
  getMelodiesFromFuzzyScores,
};
