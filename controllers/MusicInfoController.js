const MusicInfoControllerModel = require("../models/TrackMetadataModel");

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


module.exports.getTracksMetadata = async (req,res) => {
    console.log("---module.exports.getTracksMetadata--- req.headers:", req.headers);
    console.log("req.params: ",req.params);
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    // Removing doublons from lognumbers
    const lognumbers = [...new Set(req.query.lognumbers)]; 
    console.log("~~ At ",(new Date()),"\n# is: ",lognumbers.length,", lognumbers: ", lognumbers);
    
    // { $in: lognumbers} 
    // {lognumber: { $regex: `^${lognumbers}_.{2}$`} } 
            
    // We need to change the way we make our selection for SJA. 
    // MusicInfoControllerModel.find( { lognumber:
    //             { $in: lognumbers.map((lognumber) => lognumber.includes("SJA")?  new RegExp(`^${lognumber}_.{2}$`) : lognumber ), } }
    // )
    MusicInfoControllerModel.find(
        { lognumber: { $in: lognumbers} }
    )
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}  


module.exports.get_idContent_recording = async (req,res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_recording: ",{_id, typeCaller, indexRange});
    const queryCondition = { _id:_id };
    MusicInfoControllerModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}

// TODO modify beforePrivateBeta
// We need to make the seleciton of RECORDING, not TRACK
module.exports.get_idContent_track = async (req,res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_track: ",{_id, typeCaller, indexRange});
    const queryCondition = { _id:_id };
    MusicInfoControllerModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}

