const WorkflowModel = require("../models/WorkflowModel");

module.exports.addWorkflow = async (req, res) => {
    console.log("---module.exports.addWorkflow--- req.body:", req.body);
    const { 
        title, 
        time, 
        description,
        author,
        searches = [],
        searchesTimes= []
    } = req.body;

    WorkflowModel.create({ 
        title:title, 
        time:time, 
        description:description,
        author:author,
        searches:searches,
        searchesTimes:searchesTimes
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

module.exports.getWorkflows = async (req, res) => {
    console.log("---module.exports.getWorkflows--- req.query:", req.query);
    const { title, time, author  } = req.query;
    // TODO assess whether time of creation is a good way to identify the workflow
    WorkflowModel.find({title:title, author: author, time:time})
        .then(data => {
            console.log("Searched successfully WorkflowModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

module.exports.deleteWorkflow = async (req, res) => {
    console.log("---module.exports.deleteWorkflow--- req.query:", req.query, ", req.body: ", req.body);

    const { _id } = req.body;

    WorkflowModel.findByIdAndDelete(_id)
        .then(() => {
            console.log("Deleted successfully");
            res.send("Deleted successfully");
        })
        .catch((err) => {
            console.log(err);
        });
}

// TODO change the code inside the functions
module.exports.changeTitle = async (req, res) => {
    console.log("module.exports.changeTitle. req.body: ", req.body);
    const { _id, text, userId } = req.body;

    WorkflowModel.findByIdAndUpdate(_id, {
        $set: { title: text },
    })
        .then(() => {
            console.log("changeTitle successfully");
            res.send("changeTitle successfully");
        })
        .catch((err) => {
            console.log(err);
        });
};

module.exports.changeDescription = async (req, res) => {
    console.log("module.exports.changeTitle. req.body: ", req.body);
    const { _id, text, userId } = req.body;

    // TODO change, this should make a modification on collaborators
    WorkflowModel.findByIdAndUpdate(_id, {
        $set: { description: text },
    })
        .then(() => {
            console.log("changeTitle successfully");
            res.send("changeTitle successfully");
        })
        .catch((err) => {
            console.log(err);
        });
};


// TODO more functionalities for workflow: 
// - add search
// - ... WHAT ELSE?
module.exports.addSearch = async (req, res) => {
    console.log("module.exports.addSearch. req.body: ", req.body);
    const { _id, text, time, userId } = req.body;

    // TODO change, this should make a modification on collaborators
    WorkflowModel.findByIdAndUpdate(_id, {
        $push: { searches: text, searchesTimes:time },
    })
        .then(() => {
            console.log("changeTitle successfully");
            res.send("changeTitle successfully");
        })
        .catch((err) => {
            console.log(err);
        });
};
