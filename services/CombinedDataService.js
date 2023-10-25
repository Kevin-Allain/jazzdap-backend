const Fuzzy_scoreModel = require("../models/fuzzy_scoreModel");
const TrackModel = require("../models/TrackModel");

function calculateIntervalSum(melody) {
    let sum = 0;
    for (let i = 0; i < melody.length - 1; i++) {
        sum += melody[i] - melody[i + 1];
    }
    return sum;
}

function map_to_fuzzy_score(score) {
    if (score < -7) { return -4 }
    else if (score >= -7 && score <= -5) { return -3 }
    else if (score >= -4 && score <= -3) { return -2 }
    else if (score >= -2 && score <= -1) { return -1 }
    else if (score === 0) { return 0 }
    else if (score >= 1 && score <= 2) { return 1 }
    else if (score >= 3 && score <= 4) { return 2 }
    else if (score >= 5 && score <= 7) { return 3 }
    else { return 4 }
}

// This one might be useless
function characterizeFuzzyScore(fuzzyContourInput) {
    let characterizationInput = null;
    if (fuzzyContourInput <= -4) {
        characterizationInput =   "big jump down";
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

function calcLevenshteinDistance_int(arr1, arr2) {
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

  function calcLevenshteinDistance_int_relative(arrInput1, arrInput2) {
    let arr1 = arrInput1.map(a=> a-Math.min(...arrInput1))
    let arr2 = arrInput2.map(a=> a-Math.min(...arrInput2))
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
        )
  }


getFuzzyScores = async (score, distance) => {
    let query = {};
    query[`fuzzyRange${distance}`] = score;

    // Return the promise from the find method
    return Fuzzy_scoreModel.find(query);
}

getTracksFromFirstId = async (arrIds) => {
    return TrackModel.find(
        {
            _id: {
                $in: arrIds
            }
        },
    );
}

getMelodiesFromTrackId = async (data, lengthSearch) => {
    const batchSize = 100; // Set an appropriate batch size
    const results = [];

    for (let i = 0; i < data.length; i += batchSize) {
        const batchData = data.slice(i, i + batchSize);
        const orQueries = batchData.map(({ track, m_id }) => {
            const minMId = m_id;
            const maxMId = m_id + lengthSearch;
            return {
                track: track,
                m_id: { $gte: minMId, $lte: maxMId }
            };
        });
        const batchResults = await TrackModel
            .find({ $or: orQueries })
            .sort({ m_id: 1 })
            .lean();
        results.push(...batchResults);
    }
    return results;
};

    // // Use external sorting to avoid memory limit issues
    // let result = TrackModel.find({ $or: orQueries }).lean()
    // // .explain('executionStats');
    // // console.log("-- getMelodiesFromTrackId - result: ",result);
    // return result;
    // // .sort({ m_id: 1 }).hint({ $natural: 1 });

    // const query2 = {
    //     $or: data.map(({ track, m_id }) => {
    //         const minMId = m_id;
    //         const maxMId = m_id + lengthSearch;
    //         return {
    //             track,
    //             m_id: { $lte: maxMId, $gte: minMId }
    //         };
    //     })
    // };
    // return TrackModel.aggregate([
    //     { $match: query2 },
    //     {
    //         $addFields: {
    //             startSequence: {
    //                 $in: ["$_id", data.map(item => item._id)]
    //             }
    //         }
    //     }
    // ]).exec();




module.exports = {
    calcLevenshteinDistance_int,
    calcLevenshteinDistance_int_relative,
    calcLevenshteinDistance_int_optimistic,
    map_to_fuzzy_score,
    calculateIntervalSum,
    getFuzzyScores,
    getTracksFromFirstId,
    getMelodiesFromTrackId
};
