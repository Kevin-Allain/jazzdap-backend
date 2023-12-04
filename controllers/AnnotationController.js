const AnnotationModel = require("../models/AnnotationModel");

// idCaller is the objectId: an identifier for the object in the database related to the annotation.
module.exports.addAnnotation = async (req, res) => {
    console.log("---module.exports.addAnnotation--- req.body:", req.body);
    const { type, info, indexAnnotation, annotationInput, author, privacy, time, idCaller } = req.body;

        AnnotationModel.create({
            type: type,
            info: info,
            indexAnnotation: indexAnnotation,
            annotationInput: annotationInput,
            author: author,
            privacy: privacy,
            time: time,
            objectId: idCaller
        })
            .then((data) => {
                console.log("Added successfully");
                console.log(data);
                res.send(data);
            })
            .catch((err) => {
                console.log(err);
            });
    // }
};

// index is useful for many samples matching from one song
module.exports.getAnnotations = async (req, res) => {
    console.log("---module.exports.getAnnotations--- req.query:", req.query);
    const { type, info, indexAnnotation, idCaller, user } = req.query;
    console.log("---- idCaller: ",idCaller);
    console.log('user: ', user,', (typeof user): ', (typeof user));
    let queryCondition;
    if (idCaller) {
        // If idCaller is not null
        queryCondition = {
          $and: [
            { type: type },
            // { info: info },
            { objectId: idCaller },
            { $or: [{ privacy: "public" }, { author: user }] },
          ],
        };
    } else {
        queryCondition = {
          $and: [
            { type: type },
            { info: info },
            { $or: [{ privacy: "public" }, { author: user }] },
          ],
        };
    }

    AnnotationModel.find(queryCondition)
      .then((data) => {
        console.log("Searched successfully AnnotationModel.find");
        console.log("data.length: ", data.length);
        res.send(data);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
};


module.exports.get_idContent_annotation = async (req,res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_annotation: ",{_id, typeCaller, indexRange});
    const queryCondition = {
        _id:_id
    };
    AnnotationModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully AnnotationModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}


module.exports.deleteAnnotation = async (req, res) => {
    console.log("---module.exports.deleteAnnotation--- req.query:", req.query, ", req.body: ", req.body);

    const { _id } = req.body;

    AnnotationModel.findByIdAndDelete(_id)
        .then(() => {
            console.log("Deleted successfully");
            res.send("Deleted successfully");
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports.updateAnnotation = async (req, res) => {
    console.log("module.exports.updateAnnotation. req.body: ", req.body);
    const { _id, annotationInput, userId } = req.body;

    // TODO change, this should make a modification on collaborators
    AnnotationModel.findByIdAndUpdate(_id, {
        $set: { annotationInput: annotationInput }, //, author: userId },
        $push: { collaborators: userId },
    })
        .then(() => {
            console.log("Updated successfully");
            res.send("Updated successfully");
        })
        .catch((err) => {
            console.log(err);
        });
};


// comments for annotations?