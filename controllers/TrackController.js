const TrackModel = require("../models/TrackModel");

module.exports.getMusicMIDI = async (req, res) => {
    console.log("---module.exports.getMusicMIDI--- req.headers:", req.headers);
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    console.log("req.params: ",req.params);


    const { recording, user } = req.query;
    console.log("recording: ",recording,", user: ", user)

    TrackModel.find({recording:recording})
        .then(data =>{
            console.log("Searched successfully TrackModel.find")
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

    TrackModel.find({recording:recording, m_id: {$gte:firstNoteIndex, $lte:lastNodeIndex} })
        .then(data =>{
            console.log("Searched successfully TrackModel.find")
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

    console.log("TIME CALL: ",new Date());

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
    TrackModel.find({ pitch: firstNote })
        .then(data => {
            console.log("Searched successfully TrackModel.find")
            console.log("data[0]: ", data[0]);
            console.log("====")
            console.log("TIME FIRST SEARCG: ",new Date());

            // then find back other matches...
            // get all the recordings, tracks, and matching m_id to push through
            // const arr_m_id = data.map(a => a.m_id);
            // const arr_recording = data.map(a => a.recording);
            const uniqueIds = data.map(a => a._id);
            console.log("uniqueIds[0]: ", uniqueIds[0]);
            const uniqueStrIds = data.map(a => a._id.toString());
            console.log("uniqueStrIds[0]: ", uniqueStrIds[0]);

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

                TrackModel.find(query)
                    .lean()
                    .sort({ recording: 1, m_id: 1 })
                    .then(d => {
                        console.log("TIME SECOND CALL: ",new Date());

                        //   console.log(d[0])
                        console.log("d[0]._id.toString(): ", d[0]._id.toString())
                        console.log("uniqueStrIds[0]: ", uniqueStrIds[0])

                        // d = d.sort((a, b) => a.recording - b.recording || a.m_id - b.m_id)

                        console.log("ignored the sorting in backend");

                        // identify where the sequence started
                        d.forEach(a =>
                            a.startSequence = (uniqueStrIds.findIndex(b => b === a._id.toString()) !== -1) ? true : false
                        );

                        console.log("Added indications of startSequence")
                        console.log("TIME SEQUENCES MARK: ",new Date());

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
}


module.exports.getMatchLevenshteinDistance2 = async (req, res) => {
    console.log("---module.exports.getMatchLevenshteinDistance2---");
    console.log("req.query: ", req.query);
    console.log("req.body: ", req.body);
    console.log("req.params: ", req.params);

    console.log("TIME CALL: ", new Date());

    // loading the entirety of the database will be a massive problem... 
    // we have to consider clever approaches to do so
    const arrayStrNotes = req.query.stringNotes.split('-')
    const arrayNotes = arrayStrNotes.map(a => parseInt(a))
    const firstNote = arrayNotes[0];
    const lengthSearch = arrayNotes.length;
    console.log("firstNote: ", firstNote, ", lengthSearch: ", lengthSearch);
    // First Query: Get objects with matching pitch
    const query1 = { pitch: firstNote };

    TrackModel.find(query1)
        .lean()
        .then(data => {

            console.log("TIME CALL first query: ", new Date());
            console.log("data: ", data);
            // const recordingIds = data.map(item => item.recording);

            // Second Query: Get objects with matching recording and m_id range
            const query2 = {
                $or: data.map(({ recording, m_id }) => {
                    const minMId = m_id;
                    const maxMId = m_id + lengthSearch;
                    return {
                        recording,
                        m_id: { $lte: maxMId, $gte: minMId }
                    };
                })
            };

            return TrackModel.aggregate([
                { $match: query2 },
                {
                    $addFields: {
                        startSequence: {
                            $in: ["$_id", data.map(item => item._id)]
                        }
                    }
                }
            ]).exec();
        })
        .then(finalResult => {
            // finalResult contains the queried documents with the assigned startSequence attribute
            // Rest of your code...
            console.log("TIME AFTER COMPLEX QUERY: ", new Date())
            console.log("finalResult.length: ", finalResult.length);
            res.send(finalResult);
        })
        .catch(error => {
            res.status(500).json(error);
        });

}


module.exports.get_idContent_sample = async (req, res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_sample: ", { _id, typeCaller, indexRange });
    const queryCondition = {
        _id: _id
    };
    TrackModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully TrackModel.find for ", typeCaller);
            console.log("data.length: ", data.length);
            if (data.length > 0) {
                const baseM_id = Number(data[0].m_id);
                const nextM_id = baseM_id + Number(indexRange);
                const recording = data[0].recording;
                console.log({recording, baseM_id,nextM_id});
                const queryCondition2 = {
                    recording: recording,
                    m_id: { $lte: nextM_id, $gte: baseM_id }
                };

                TrackModel.find(queryCondition2)
                    .then(fullData => {
                        console.log("Second search successful. length is: ", fullData.length);
                        res.send(fullData);
                    })
            }
            // res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}
