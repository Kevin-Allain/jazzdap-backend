const CommentModel = require("../models/CommentModel");

module.exports.addComment = async (req, res) => {
    console.log("---module.exports.addComment--- req.body:", req.body);
    const { 
        type, 
        info, 
        indexComment, 
        commentInput, 
        author, 
        privacy, 
        time, 
        commentId,
        annotationId=null 
    } = req.body;

    console.log("@ addComment of CommentController. commentId: ",commentId,", (typeof commentId): ",(typeof commentId),", annotationId: ",annotationId);

    CommentModel.create({ 
        type: type, 
        info: info, 
        indexComment:indexComment, 
        commentInput: commentInput, 
        author: author, 
        privacy: privacy, 
        time: time, 
        commentId:commentId,
        annotationId:annotationId
    })
        .then((data) => {
            console.log("Added successfully");
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
        });
};


// This is a very weird function... We select {*}comments{*} based on annotations, not comments
module.exports.getComments = async (req, res) => {
    console.log("---module.exports.getComments--- req.query:", req.query);
    const { commentId } = req.query;

    // CommentModel.find({ type: type, info: info, indexComment:indexComment })
    CommentModel.find({commentId:commentId})
        .then(data => {
            console.log("Searched successfully CommentModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

module.exports.getCommentsOfAnnotation = async (req, res) => {
    console.log("---module.exports.getCommentsOfAnnotation--- req.query:", req.query);
    const { annotationId } = req.query;

    // CommentModel.find({ type: type, info: info, indexComment:indexComment })
    CommentModel.find({annotationId:annotationId})
        .then(data => {
            console.log("Searched successfully CommentModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};


module.exports.get_idContent_comment = async (req,res) => {
    const { _id, typeCaller, indexRange } = req.query;
    console.log("get_idContent_comment: ",{_id, typeCaller, indexRange});
    const queryCondition = { _id:_id };
    CommentModel.find(queryCondition)
        .then(data => {
            console.log("Searched successfully CommentModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
}


module.exports.deleteComment = async (req, res) => {
    console.log("---module.exports.deleteComment--- req.query:", req.query, ", req.body: ", req.body);

    const { _id } = req.body;

    CommentModel.findByIdAndDelete(_id)
        .then(() => {
            console.log("Deleted successfully");
            res.send("Deleted successfully");
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports.updateComment = async (req, res) => {
    console.log("module.exports.updateComment. req.body: ", req.body);
    const { _id, commentInput, userId } = req.body;

    // TODO change, this should make a modification on collaborators
    CommentModel.findByIdAndUpdate(_id, {
        $set: { commentInput: commentInput }, //, author: userId },
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