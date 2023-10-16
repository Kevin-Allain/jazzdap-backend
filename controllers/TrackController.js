const TrackModel = require("../models/TrackModel");

// unsure if useful
// module.exports.getTrackFrom_Id = async (req, res) => {
//     console.log("---module.exports.getTrackFrom_Id--- req.query._id: ",req.query.idTrack);
//     const query1 = { _id:  req.query.idTrack};
//     TrackModel.find(query1)
//     .then(data => {
//         res.seend(data);
//     })
// }


module.exports.getMusicMIDI = async (req, res) => {
    console.log("---module.exports.getMusicMIDI--- req.headers:", req.headers);
    console.log("req.query: ",req.query);
    console.log("req.body: ",req.body);
    console.log("req.params: ",req.params);


    const { track, user } = req.query;
    console.log("track: ",track,", user: ", user)

    TrackModel.find({track:track})
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


    const { track, firstNoteIndex, lastNodeIndex , user } = req.query;
    console.log("track: ",track, ", firstNoteIndex: ",firstNoteIndex, ", lastNodeIndex: " ,lastNodeIndex,", user: ", user)

    TrackModel.find({track:track, m_id: {$gte:firstNoteIndex, $lte:lastNodeIndex} })
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
            const uniqueIds = data.map(a => a._id);
            console.log("uniqueIds[0]: ", uniqueIds[0]);
            const uniqueStrIds = data.map(a => a._id.toString());
            console.log("uniqueStrIds[0]: ", uniqueStrIds[0]);

            // If there is no match, then return data already?
            if (data[0] === undefined) {
                res.send(data);
            } else {

                const query = {
                    $or: data.map(({ track, m_id }) => {
                        const minMId = m_id;
                        const maxMId = m_id + lengthSearch;
                        return {
                            track,
                            m_id: { $lte: maxMId, $gte: minMId }
                        };
                    })
                };

                TrackModel.find(query)
                    .lean()
                    .sort({ track: 1, m_id: 1 })
                    .then(d => {
                        console.log("TIME SECOND CALL: ",new Date());

                        //   console.log(d[0])
                        console.log("d[0]._id.toString(): ", d[0]._id.toString())
                        console.log("uniqueStrIds[0]: ", uniqueStrIds[0])

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
            console.log("data[0]: ", data[0]);
            if (data.length===0){ return; }
            // Second Query: Get objects with matching track and m_id range
            const query2 = {
                $or: data.map(({ track, m_id }) => {
                    const minMId = m_id;
                    const maxMId = m_id + lengthSearch;
                    return {
                        track,
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
            console.log("typeof finalResult: ", typeof finalResult)
            if (typeof finalResult === 'undefined') {
                res.send([]);
                return; // doubt about usefulness of this one
            } else {
                console.log("finalResult.length: ", finalResult.length);
                res.send(finalResult);
            }
        })
        .catch(error => {
            res.status(500).json(error);
        });
}


module.exports.getMatchFuzzy = async (req,res) => {

    const arrayStrNotes = req.query.stringNotes.split('-')
    const arrayNotes = arrayStrNotes.map(a => parseInt(a))
    const firstNote = arrayNotes[0];
    const lengthSearch = arrayNotes.length;

    function calculateIntervalSum(melody) {
        let sum = 0;
        for (let i = 0; i < melody.length-1; i++) {
          sum += melody[i] - melody[i+1]; 
        }
        return sum;
      }

    let fuzzyContourInput = calculateIntervalSum(arrayNotes);
    let characterizationInput = null;
    if (fuzzyContourInput <= -4){
        characterizationInput = "big jump down";
    } else if (fuzzyContourInput === -3){
        characterizationInput = "jump down";
    } else if (fuzzyContourInput === -2){
        characterizationInput = "leap down";
    } else if (fuzzyContourInput === -1){
        characterizationInput = "step down";
    } else if (fuzzyContourInput === 0){
        characterizationInput = "jump down";
    } else if (fuzzyContourInput === 1){
        characterizationInput = "step up";
    } else if (fuzzyContourInput === 2){
        characterizationInput = "leap up";
    }else if (fuzzyContourInput === 3){
        characterizationInput = "jump up";
    }else {
        characterizationInput = "big jump up";
    }

    TrackModel.aggregate([
        // Filter tracks
        {$match: {pitch: firstNote}},
        // Filter m_id range
        {$match: {
          m_id: {
            $gte: firstNote.m_id,  
            $lt: firstNote.m_id + lengthSearch
          }
        }},      
        // Calculate fuzzyScore
        {$addFields: {
          fuzzyScore: {
            $reduce: {
              input: {$slice: ["$pitch", lengthSearch]},  
              initialValue: 0,
              in: {
                $sum: [
                  "$$value",  
                  {$subtract: ["$$this", "$$value"]}
                ]
              }  
            }
          }
        }},
        // Filter by fuzzyScore 
        {$match: {fuzzyScore: {$gte: -4, $lte: 4}}}
      ]).then(d => {
        console.log("search done with getMatchFuzzy. d: ",d);
      })

}


module.exports.get_idContent_sample = async (req, res) => {
    console.log("get_idContent_sample. req: ", req, ", res: ",res);
    let { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_sample: ", { _id, typeCaller, indexRange });
    if (isNaN(indexRange)) { indexRange = 0; }
    const queryCondition = { _id: _id };
    return TrackModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully TrackModel.find for ", typeCaller,", _id: ",_id);
            console.log("data.length: ", data.length);
            if (data.length > 0) {
                const baseM_id = Number(data[0].m_id);
                const nextM_id = baseM_id + Number(indexRange);
                const track = data[0].track;
                console.log({ track, baseM_id, nextM_id });
                const queryCondition2 = {
                    track: track,
                    m_id: { $lte: nextM_id, $gte: baseM_id }
                };

                return TrackModel.find(queryCondition2)
                    .then(fullData => {
                        console.log("Second search successful. length is: ", fullData.length);
                        if (res) {
                            console.log("res TrackController if 1: ",res);                            
                            res.send(fullData);
                        } else {
                            console.log("res TrackController if 2: ", res);
                            return fullData;
                        }
                    });
            } else {
                if (res) {
                    console.log("res TrackController if 3: ",res);                            
                    res.send([]); // Send an empty response if no data is found
                } else {
                    console.log("res TrackController if 4: ",res);                            
                    return []; // Return an empty array if no data is found
                }
            }
        })
        .catch(error => {
            if (res) {
                res.status(500).json(error); // Send the error response if res parameter is provided
            } else {
                throw error; // Throw the error to be caught by the caller function if res parameter is not provided
            }
        });
}

