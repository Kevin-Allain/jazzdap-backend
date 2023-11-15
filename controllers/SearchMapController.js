const SearchMapModel = require("../models/SearchMapModel");

// Get an existing saved SearchMap
// We make the assumption that filterArtist, filterRecording, filterTrack exist. They can be empty strings.
module.exports.getSearchMap = async (req, res) => {
    console.log("---module.exports.getSearchMap")
    console.log("req.query: ", req.query);
    const { query, filterArtist, filterRecording, filterTrack, percMatch } = req.query;
    let queryRes = { query: query, percMatch: percMatch };
    if (filterArtist === '') { queryRes.filterArtist = filterArtist }
    if (filterRecording === '') { queryRes.filterRecording = filterRecording }
    if (filterTrack === '') { queryRes.filterTrack = filterTrack }
    SearchMapModel.find(queryRes)
        .then(data => {
            console.log("Searched successfully SearchMapModel.find")
            console.log(data);
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
