const AnnotationModel = require("../models/AnnotationModel");

module.exports.addAnnotation = async (req, res) => {
    console.log("---module.exports.addAnnotation--- req.headers:", req.headers);
    const { type, info, annotationInput, user, privacy } = req.body;

    AnnotationModel.create({ type: type, info: info, annotationInput: annotationInput, user: user, privacy: privacy })
        .then((data) => {
            console.log("Added successfully");
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
        });
};


module.exports.getAnnotations = async (req, res) => {
    console.log("---module.exports.getAnnotations--- req.query:", req.query);
    const { type, info } = req.query;

    AnnotationModel.find({ type: type, info: info })
        .then(data => {
            console.log("Searched successfully.")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

module.exports.deleteAnnotation = async (req, res) => {
    console.log("---module.exports.deleteAnnotation--- req.query:", req.query,", req.body: ",req.body);
    
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
    console.log( "module.exports.updateAnnotation. req.body: ",req.body);
    const { _id, annotationInput, userId } = req.body;
  
    AnnotationModel.findByIdAndUpdate(_id, {
      $set: { annotationInput: annotationInput, user: userId },
    })
      .then(() => {
        console.log("Updated successfully");
        res.send("Updated successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  