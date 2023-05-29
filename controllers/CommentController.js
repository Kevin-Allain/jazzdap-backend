const CommentModel = require("../models/CommentModel");

module.exports.addComment = async (req, res) => {
    console.log("---module.exports.addComment--- req.body:", req.body);
    const { type, info, index, commentInput, author, privacy } = req.body;

    CommentModel.create({ type: type, info: info, index:index, commentInput: commentInput, author: author, privacy: privacy })
        .then((data) => {
            console.log("Added successfully");
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
        });
};


module.exports.getComments = async (req, res) => {
    console.log("---module.exports.getComments--- req.query:", req.query);
    const { type, info, index } = req.query;

    // TODO assess with tests if approach correct
    CommentModel.find({ type: type, info: info, index:index })
        .then(data => {
            console.log("Searched successfully.")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

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