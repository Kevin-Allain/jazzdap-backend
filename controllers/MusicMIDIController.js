const MusicMIDIModel = require("../models/TrackModel");

module.exports.getMusicMIDI = async (req, res) => {
    console.log("---module.exports.getMusicMIDI--- req.headers:", JSON.stringify(req.headers));
    console.log("req.query: ",JSON.stringify(req.query));
    console.log("req.body: ",JSON.stringify(req.body));
    console.log("req.params: ",JSON.stringify(req.params));


    const { recording, user } = req.query;
    console.log("recording: ",recording,", user: ", user)

    MusicMIDIModel.find({recording:recording})
        .then(data =>{
            console.log("Searched successfully.")
            console.log(data);

            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
    // console.log("musicMIDI: ",musicMIDI)
    // res.send(musicMIDI);
  };


