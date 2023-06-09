const AnnotationModel = require("../models/AnnotationModel");


module.exports.getUserAnnotations = async (req, res) => {
    console.log("---module.exports.getUserAnnotations--- req.query:", req.query);
    const { user } = req.query;

    console.log('user: ', user,', (typeof user): ', (typeof user));
    const queryCondition = {  author: user };

    AnnotationModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully AnnotationModel.find for getUserAnnotations")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

