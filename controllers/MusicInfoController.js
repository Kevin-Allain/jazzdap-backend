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
    const lognumbers = req.query.lognumbers;
    console.log("lognumbers: ", lognumbers);

    MusicInfoControllerModel.find( {lognumber: { $in: lognumbers} } )
        .then(data =>{
            console.log("Searched successfully MusicInfoControllerModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
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

