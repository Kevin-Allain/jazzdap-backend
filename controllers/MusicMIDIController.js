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
            // console.log(data);

            res.send(data);
        })
        .catch(error=>{res.status(500).json(error);})
    // console.log("musicMIDI: ",musicMIDI)
    // res.send(musicMIDI);
  };



  module.exports.getSampleMIDI = async (req, res) => {
    console.log("---module.exports.getSampleMIDI--- req.headers:", JSON.stringify(req.headers));
    console.log("req.query: ",JSON.stringify(req.query));
    console.log("req.body: ",JSON.stringify(req.body));
    console.log("req.params: ",JSON.stringify(req.params));


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



  module.exports.getMatchLevenshteinDistance  =async (req,res) => {
    console.log("---module.exports.getMatchLevenshteinDistance--- req.headers:", JSON.stringify(req.headers));
    console.log("req.query: ",JSON.stringify(req.query));
    console.log("req.body: ",JSON.stringify(req.body));
    console.log("req.params: ",JSON.stringify(req.params));

    // loading the entirety of the database will be a massive problem... 
    // we have to consider clever approaches to do so
    const arrayStrNotes = req.query.stringNotes.split('-')
    const arrayNotes = arrayStrNotes.map( a => parseInt(a))
    const firstNote = arrayNotes[0];
    const lengthSearch = arrayNotes.length;

    console.log("firstNote: ",firstNote,", lengthSearch: ",lengthSearch);

      // First approach is... imperfect, but will somehow be something...
      // get all notes matching the first one 
      // and then return all the following notes according to m_id
      MusicMIDIModel.find({ pitch: firstNote })
          .then(data => {
              console.log("Searched successfully.")
              console.log("data[0]: ", data[0]);
              console.log("====")
              // then find back other matches...
              // get all the recordings, tracks, and matching m_id to push through
              arr_m_id = data.map(a => a.m_id);
              arr_recording = data.map(a => a.recording);

            // const l_search = data.map( a => {"recording"=a.recording, "m_id"=a.m_id})
            // console.log("l_search[0]: ", l_search[0])

            // this is a test
            //   const searches = [
            //     { recording: "BGR0082-T1", m_id: 0 },
            //     { recording: "BGR0082-T2", m_id: 1 },
            //     { recording: "BGR0083-T1", m_id: 0 }              
            //   ]

              const query = {
                $or: data.map(({ recording, m_id }) => {
                  const minMId = m_id;
                  const maxMId = m_id + 3;
                  return { recording, m_id: { $lte: maxMId, $gte: minMId } };
                })
              };

              MusicMIDIModel.find(query)
                .then(d => {
                    console.log("query passed.")
                    console.log("d[0]: ",d[0])
                    res.send(d);
                })

          })
          .catch(error => { res.status(500).json(error); })


    // res.send("TODO")
  }
