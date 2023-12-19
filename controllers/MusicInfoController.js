const mongoose = require('mongoose');
const MusicInfoControllerModel = require("../models/TrackMetadataModel");
const TrackModel = require("../models/TrackModel");


module.exports.getTrackMetadata = async (req, res) => {
    console.log("---module.exports.getTrackMetadata--- req.headers:", req.headers);
    console.log("req.query: ", req.query);
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);

    const { lognumber, user } = req.query;
    console.log("lognumber: ", lognumber, ", typeof lognumber: ", (typeof lognumber), ", user: ", user)

    MusicInfoControllerModel.find({ lognumber: lognumber })
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};


module.exports.getTrackMetaFromNoteId = async (req, res) => {
    console.log("---module.exports.getTrackMetaFromNoteId ");
    console.log("req.query: ", req.query);
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);
    const { idTrack } = req.query;
    console.log("idTrack: ", idTrack);
    TrackModel.find({ _id: new mongoose.Types.ObjectId(idTrack) })
        .then(d => {
            console.log("found a note. d: ", d);
            if (d.length > 0) {
                const noteObject = d[0];
                // then look if there is SJA_ID and use it. Otherwise, use lognumber.
                if (noteObject.SJA_ID) {
                    MusicInfoControllerModel.find({ SJA_ID: noteObject.SJA_ID })
                        .then(data => {
                            console.log("SJA_ID defined. Searched successfully MusicInfoControllerModel.find")
                            console.log("data.length: ", data.length);
                            res.send(data);
                        })
                        .catch(error => { res.status(500).json(error); })
                } else {
                    MusicInfoControllerModel.find({ lognumber: noteObject.lognumber })
                        .then(data => {
                            console.log("SJA_ID not defined. Searched successfully MusicInfoControllerModel.find")
                            console.log("data.length: ", data.length);
                            res.send(data);
                        })
                        .catch(error => { res.status(500).json(error); })
                }
            } else {
                res.send(d);
            }
        })
        .catch(error => { res.status(500).json(error); })
}

module.exports.getTracksMetadata = async (req, res) => {
    console.log("---module.exports.getTracksMetadata");
    // console.log("req.params: ", req.params);
    // console.log("req.query: ", req.query);
    // console.log("req.body: ", req.body);
    // Removing doublons from lognumbers
    const lognumbers = [...new Set(req.query.lognumbers)];
    // console.log("~~ At ", (new Date()), "\n# is: ", lognumbers.length, ", lognumbers: ", lognumbers);
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
            // console.log("data[0]: ", data[0]);
            if (res) { res.send(data); }
            else { return data; }
        })
        .catch(error => { res.status(500).json(error); })
}  


module.exports.get_idContent_recording = async (req, res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_recording: ", { _id, typeCaller, indexRange });
    // Test the updated code, because the _id with typeCaller is actually matching on track database. We need to first get the track and then use its info to get the recording
    // Do we always have the issue?
    const queryCondition = { _id: _id };
    TrackModel.find(queryCondition)
        .then(trackMatch => {
            // console.log("trackMatch[0]: ",trackMatch[0]);
            // get the SJA_ID if we have it, otherwise, we'll use lognumber...
            let curTrackMatch = trackMatch[0];
            // let keysCTM = Object.keys(curTrackMatch);
            // console.log("keysCTM: ",keysCTM);
            // for(let i in keysCTM){ console.log("i: ",i,", curTrackMatch[keysCTM[i]]: ",curTrackMatch[keysCTM[i]]); }
            let keysCTM_doc = Object.keys(curTrackMatch._doc);
            for(let i in keysCTM_doc){ console.log("i: ",i,", curTrackMatch._doc[keysCTM_doc[i]]: ",curTrackMatch._doc[keysCTM_doc[i]]); }
            // console.log("keysCTM_doc: ",keysCTM_doc);
            // console.log("curTrackMatch._doc['SJA_ID']: ", curTrackMatch._doc['SJA_ID']);
            // console.log("curTrackMatch._doc.SJA_ID: ",curTrackMatch._doc.SJA_ID);
            const sjaCode = curTrackMatch._doc.SJA_ID?curTrackMatch._doc.SJA_ID:'';
            const queryConditionMeta = sjaCode?{'SJA_ID':sjaCode}:{lognumber:trackMatch[0].lognumber};
            // console.log("sjaCode: ",sjaCode,", queryConditionMeta: ",queryConditionMeta);
            MusicInfoControllerModel.find(queryConditionMeta)
                .then(data => {
                    console.log("Searched successfully MusicInfoControllerModel.find")
                    console.log("data.length: ", data.length);
                    // if(data.length===1){ console.log("data: ",data) }
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
            // console.log("trackMatch[0]: ",trackMatch[0]);
            // get the SJA_ID if we have it, otherwise, we'll use lognumber...
            let curTrackMatch = trackMatch[0];
            // let keysCTM = Object.keys(curTrackMatch);
            // console.log("keysCTM: ",keysCTM);
            // for(let i in keysCTM){ console.log("i: ",i,", curTrackMatch[keysCTM[i]]: ",curTrackMatch[keysCTM[i]]); }
            let keysCTM_doc = Object.keys(curTrackMatch._doc);
            for (let i in keysCTM_doc) { console.log("i: ", i, ", curTrackMatch._doc[keysCTM_doc[i]]: ", curTrackMatch._doc[keysCTM_doc[i]]); }
            // console.log("keysCTM_doc: ",keysCTM_doc);
            // console.log("curTrackMatch._doc['SJA_ID']: ", curTrackMatch._doc['SJA_ID']);
            // console.log("curTrackMatch._doc.SJA_ID: ",curTrackMatch._doc.SJA_ID);
            const sjaCode = curTrackMatch._doc.SJA_ID ? curTrackMatch._doc.SJA_ID : '';
            const queryConditionMeta = sjaCode ? { 'SJA_ID': sjaCode } : { lognumber: trackMatch[0].lognumber };
            // console.log("sjaCode: ",sjaCode,", queryConditionMeta: ",queryConditionMeta);
            MusicInfoControllerModel.find(queryConditionMeta)
                .then(data => {
                    console.log("Searched successfully MusicInfoControllerModel.find")
                    console.log("data.length: ", data.length);
                    // if(data.length===1){ console.log("data: ",data) }
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

module.exports.testMetadata = async (req, res) => {
  const sjaIdTest = "SJA_AC_A0007_N0020_E0023_Y14031957_07";
  const queryCondition = { SJA_ID: sjaIdTest };
  MusicInfoControllerModel.find().then((data) => {
    console.log("Found the data: ", data);
    res.send(data);
  })
  .catch(error =>{
    console.log("Error still in testMetadata");
    res.status(500).json(error);
  })
};