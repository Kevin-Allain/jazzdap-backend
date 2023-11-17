const MusicInfoControllerModel = require("../models/TrackMetadataModel");
const TrackModel = require("../models/TrackModel");


module.exports.getTrackMetadata = async (req, res) => {
    console.log("---module.exports.getTrackMetadata--- req.headers:", req.headers);
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    console.log("req.params: ",req.params);

    const { lognumber, user } = req.query;
    console.log("lognumber: ",lognumber,", typeof lognumber: ",(typeof lognumber),", user: ", user)

    MusicInfoControllerModel.find({lognumber:lognumber})
        .then(data =>{
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
  };


module.exports.getTracksMetadata = async (req, res) => {
    console.log("---module.exports.getTracksMetadata");
    // console.log("req.params: ", req.params);
    // console.log("req.query: ", req.query);
    // console.log("req.body: ", req.body);
    // Removing doublons from lognumbers
    const lognumbers = [...new Set(req.query.lognumbers)];
    console.log("~~ At ", (new Date()), "\n# is: ", lognumbers.length, ", lognumbers: ", lognumbers);
    // { $in: lognumbers} 
    // {lognumber: { $regex: `^${lognumbers}_.{2}$`} } 
    // We need to change the way we make our selection for SJA. 
    // MusicInfoControllerModel.find( { lognumber: { $in: lognumbers.map((lognumber) => lognumber.includes("SJA")?  new RegExp(`^${lognumber}_.{2}$`) : lognumber ), } } )
    MusicInfoControllerModel.find(
        { lognumber: { $in: lognumbers } }
    )
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            console.log("data[0]: ", data[0]);
            if (res) {
                console.log("res MusicInfoControllerModel if 1");
                res.send(data);
            } else {
                console.log("res MusicInfoControllerModel if 2");
                return data;
            }
        })
        .catch(error => { res.status(500).json(error); })
}  

// // New approach with a Promise 
// module.exports.getTracksMetadata = async (req, res) => {
//     const lognumbers = [...new Set(req.query.lognumbers)];    
//     return new Promise((resolve, reject) => {
//         MusicInfoControllerModel.find({ lognumber: { $in: lognumbers } })
//             .then(data => { console.log("Searched successfully MusicInfoControllerModel.find"); console.log("data.length: ", data.length); console.log("data[0]: ", data[0]); resolve(data); })
//             .catch(error => { reject(error); });
//     });
// }

module.exports.get_idContent_recording = async (req, res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_recording: ", { _id, typeCaller, indexRange });
    // Test the updated code, because the _id with typeCaller is actually matching on track database. We need to first get the track and then use its info to get the recording
    // Do we always have the issue?
    const queryCondition = { _id: _id };
    TrackModel.find(queryCondition)
        .then(trackMatch => {
            console.log("trackMatch[0]: ",trackMatch[0]);
            // TODO set the parameters for new queryCondition
            // get the sja id if we have it, otherwise, we'll use lognumber...
            let curTrackMatch = trackMatch[0];
            console.log("curTrackMatch['SJA ID']: ", curTrackMatch['SJA ID']);
            const sjaCode = trackMatch[0]['SJA ID']?trackMatch[0]['SJA ID']:'';
            const queryConditionMeta = sjaCode?{'SJA ID':sjaCode}:{lognumber:trackMatch[0].lognumber};
            console.log("sjaCode: ",sjaCode,", queryConditionMeta: ",queryConditionMeta);
            MusicInfoControllerModel.find(queryConditionMeta)
                .then(data => {
                    console.log("Searched successfully MusicInfoControllerModel.find")
                    console.log("data.length: ", data.length);
                    res.send(data);
                })
                .catch(error => { res.status(500).json(error); })
        })
        .catch(error => { res.status(500).json(error); })
}

module.exports.get_idContent_track = async (req, res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_track: ", { _id, typeCaller, indexRange });
    // Test the updated code, because the _id with typeCaller is actually matching on track database. We need to first get the track and then use its info to get the recording
    // Do we always have the issue?
    const queryCondition = { _id: _id };
    TrackModel.find(queryCondition)
        .then(trackMatch => {
            console.log("trackMatch[0]: ",trackMatch[0]);
            // TODO set the parameters for new queryCondition
            // get the sja id if we have it, otherwise, we'll use lognumber...
            const sjaCode = trackMatch[0]['SJA ID']?trackMatch[0]['SJA ID']:'';
            const queryConditionMeta = sjaCode?{'SJA ID':sjaCode}:{lognumber:trackMatch[0].lognumber};
            console.log("sjaCode: ",sjaCode,", queryConditionMeta: ",queryConditionMeta);
            MusicInfoControllerModel.find(queryConditionMeta)
                .then(data => {
                    console.log("Searched successfully MusicInfoControllerModel.find")
                    console.log("data.length: ", data.length);
                    res.send(data);
                })
                .catch(error => { res.status(500).json(error); })
        })
        .catch(error => { res.status(500).json(error); })
}

module.exports.getMetadataFromAttribute = async (req,res) => {
    const { attributeValue, attributeName } = req.query;
    console.log("getMetadataFromAttribute: ",{attributeValue, attributeName});
    let queryCondition = {};
    queryCondition[attributeName] = attributeValue;
    MusicInfoControllerModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}

module.exports.getMetadataFromAttributes = async (req, res) => {
    const { attributeValueArray, attributeNameArray } = req.query;
    // Ensure both arrays have the same length
    if (!Array.isArray(attributeValueArray) || !Array.isArray(attributeNameArray) || attributeValueArray.length !== attributeNameArray.length) { return res.status(400).json({ error: "Invalid input arrays" }); }
    // Mapping attribute values to their replacements
    const attributeValueMap = { 'artist': '(N) Named Artist(s)', 'recording': '(E) Event Name', 'track': 'Track Title' };
    // Replace values in attributeValueArray based on the mapping
    const sanitizedAttributeValueArray = attributeValueArray.map(value => attributeValueMap[value] || value);
    const queryCondition = {};
    // Construct the query using the sanitized arrays
    attributeNameArray.forEach((attributeName, index) => { queryCondition[attributeName] = sanitizedAttributeValueArray[index]; });
    MusicInfoControllerModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find");
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => {
            res.status(500).json(error);
        });
};
