const SearchMapModel = require("../models/SearchMapModel");

// Get an existing saved SearchMap
// We make the assumption that filterArtist, filterRecording, filterTrack exist. They can be empty strings.
module.exports.getSearchMap = async (req, res) => {
    console.log("---module.exports.getSearchMap")
    console.log("req.query: ", req.query);
    const { query, filterArtist, filterRecording, filterTrack, percMatch } = req.query;
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
      SearchMapModel.find(queryRes)
        .then(data => {
            console.log("Searched successfully SearchMapModel.find, ",data.length," elements.");
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}

// Save a SearchMap
// We make the assumption that filterArtist, filterRecording, filterTrack exist. They can be empty strings.
module.exports.createSearchMap = async (req,res) => {
    console.log("---module.exports.createSearchMap");
    const {query, filterArtist, filterRecording, filterTrack, percMatch, resIds} = req.body;
    console.log("query: ",query,", filterArtist: ",filterArtist,", filterRecording: ", filterRecording,", filterTrack: ",filterTrack,", percMatch: ",percMatch,", resIds.length: ",resIds.length);

    const data = await SearchMapModel.create({
        query: query, 
        filterArtist: filterArtist, 
        filterRecording: filterRecording, 
        filterTrack: filterTrack, 
        percMatch: percMatch,
        resIds: resIds
    });
    console.log("Created successfully a SearchMap");
    console.log(data);
    res.send(data);
}

module.exports.get_idContent_search = async (req, res) => {
    console.log("---module.exports.get_idContent_search");
    let { _id, typeCaller, indexRange } = req.query;
    const queryCondition = { _id: _id };
    return SearchMapModel.find(queryCondition)
        .then(data => {
            console.log("Successfully loaded a search. data.length: ", data.length);
            res.send(data);
        })
}