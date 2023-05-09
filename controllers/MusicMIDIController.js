const MusicMIDIModel = require("../models/TrackModel");

module.exports.getMusicMIDI = async (req, res) => {
    console.log("---module.exports.getMusicMIDI--- req.headers:", req.headers);
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    console.log("req.params: ",req.params);


    const { recording, user } = req.query;
    console.log("recording: ",recording,", user: ", user)

    MusicMIDIModel.find({recording:recording})
        .then(data =>{
            console.log("Searched successfully.")
            // console.log(data);

            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
    // console.log("musicMIDI: ",musicMIDI)
    // res.send(musicMIDI);
  };



  module.exports.getSampleMIDI = async (req, res) => {
    console.log("---module.exports.getSampleMIDI--- req.headers:", JSON.stringify(req.headers));
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    console.log("req.params: ",req.params);


    const { recording, firstNoteIndex, lastNodeIndex , user } = req.query;
    console.log("recording: ",recording, ", firstNoteIndex: ",firstNoteIndex, ", lastNodeIndex: " ,lastNodeIndex,", user: ", user)

    MusicMIDIModel.find({recording:recording, m_id: {$gte:firstNoteIndex, $lte:lastNodeIndex} })
        .then(data =>{
            console.log("Searched successfully.")
            // console.log(data);

            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
    // console.log("musicMIDI: ",musicMIDI)
    // res.send(musicMIDI);
  };



module.exports.getMatchLevenshteinDistance = async (req, res) => {
    console.log("---module.exports.getMatchLevenshteinDistance--- req.headers:", JSON.stringify(req.headers));
    console.log("req.query: ", req.query);
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);

    // loading the entirety of the database will be a massive problem... 
    // we have to consider clever approaches to do so
    const arrayStrNotes = req.query.stringNotes.split('-')
    const arrayNotes = arrayStrNotes.map(a => parseInt(a))
    const firstNote = arrayNotes[0];
    const lengthSearch = arrayNotes.length;
    console.log("firstNote: ", firstNote, ", lengthSearch: ", lengthSearch);

    // First approach is imperfect, but will somehow be something...
    // get all notes matching the first one 
    // and then return all the following notes according to m_id
    MusicMIDIModel.find({ pitch: firstNote })
        .then(data => {
            console.log("Searched successfully.")
            console.log("data[0]: ", data[0]);
            console.log("====")
            // then find back other matches...
            // get all the recordings, tracks, and matching m_id to push through
            const arr_m_id = data.map(a => a.m_id);
            const arr_recording = data.map(a => a.recording);
            const uniqueIds = data.map(a => a._id);
            console.log("uniqueIds[0]: ", uniqueIds[0]);
            const uniqueStrIds = data.map(a => a._id.toString());
            console.log("uniqueStrIds[0]: ", uniqueStrIds[0]);
            // myObjectId = ObjectId("507c7f79bcf86cd7994f6c0e")

            // If there is no match, then return data already?
            if (data[0] === undefined) {
                res.send(data);
            } else {

                const query = {
                    $or: data.map(({ recording, m_id }) => {
                        const minMId = m_id;
                        const maxMId = m_id + lengthSearch;
                        return {
                            recording,
                            m_id: { $lte: maxMId, $gte: minMId }
                        };
                    })
                };

                MusicMIDIModel.find(query)
                    .lean()
                    .then(d => {
                        //   console.log(d[0])
                        console.log("d[0]._id.toString(): ", d[0]._id.toString())
                        console.log("uniqueStrIds[0]: ", uniqueStrIds[0])

                        d = d.sort((a, b) => a.recording - b.recording || a.m_id - b.m_id)

                        // identify where the sequence started
                        d.forEach(a =>
                            a.startSequence = (uniqueStrIds.findIndex(b => b === a._id.toString()) !== -1) ? true : false
                        );
                        //   for( let k in d){ if ( uniqueStrIds.findIndex(b => ) ) }
                        console.log("query passed.")
                        console.log("d[0]: ", d[0])
                        console.log("d[0].forcingTest: ", d[0].forcingTest)
                        console.log("d[0].startSequence: ", d[0].startSequence)
                        res.send(d);
                    })
            }
        })
        .catch(error => { res.status(500).json(error); })


    // res.send("TODO")
}
