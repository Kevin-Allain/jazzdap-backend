const mongoose = require('mongoose');
const WorkflowModel = require("../models/WorkflowModel");

// Let's make the assumption that format of the workflow object(s) is done as elements are passed to the controller
module.exports.createWorkflow = async (req, res) => {
    console.log("---module.exports.createWorkflow--- req.body:", req.body);
    const { 
        title, 
        time, 
        description,
        author,
        objects = []
    } = req.body;

    WorkflowModel.create({ 
        title:title, 
        time:time, 
        description:description,
        author:author,
        objects:objects,
    })
        .then((data) => {
            console.log("Created successfully");
            console.log(data);
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
        });
};


// unclear when we will want a singular workflow... Maybe based on _id!
// e.g. get list of workflows based on a parameters, and then get the details. It won't look nice to try to show multiple workflows at the same time
module.exports.getWorkflow = async (req, res) => {
    console.log("---module.exports.getWorkflow--- req.query:", req.query);
    const { _id, user } = req.query;
    
  // Convert the string _id to a valid ObjectId
    console.log("_id: ",_id,", typeof _id: ",(typeof _id))

    WorkflowModel.findById(_id)
        .exec()
        .then(data => {
            console.log("Searched successfully a single Workflow")
            console.log("data: ",data)
            // console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};



// This can be used to get all the workflows based on some parameters: we probably want a different function to get a single workflow
// what are the parameters we will aim to set as selector attributes?
// - author
// - title
// - time?
// - contains a certain recording, track, sample
module.exports.getWorkflowsInfo = async (req, res) => {
    console.log("---module.exports.getWorkflowsInfo--- req.query:", req.query);
    const { 
        title, 
        time, 
        user
    } = req.query;
    // Likely time of creation is not a good way to identify the workflow (potentially okay for unique workflow, but... who cares? _id makes more sense)

    console.log("getWorkflowsInfo // title: ",title,", time: ",time,", user: ",user);
    const query = {};
    if (title !== undefined) {
      query.title = title;
    }
    if (user !== undefined) {
      query.author = user;
    }
    if (time !== undefined) {
      query.time = time;
    }
    
    // Should we assess here what parameters are passed, and then base our search accordingly? 
    // Or will it work already if one is undefined or null?
    WorkflowModel.find(query)
        .select('_id title time user description')
        .exec()
        .then(data => {
            console.log("Searched successfully WorkflowModel.find")
            console.log("data.length: ", data.length);
            res.send(data);
        })
        .catch(error => { res.status(500).json(error); })
};

// based on having access to the _id. Might work with same attributes to get a workflow
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

// TODO test
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

// TODO test
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


// TODO test
module.exports.addContentWorkflow = async (req, res) => {
    console.log("module.exports.addContentWorkflow. req.body: ", req.body);
    const {
        _id, // _id of of the workflow
        textNote, // text to set note related to the object
        time, // time of input
        userId, // identifier of author
        idContent, // _id of object
        typeContent, // type of the content
        objectsIndex // index of object passed
    } = req.body;

    WorkflowModel.findByIdAndUpdate(_id, {
        $push: {
          objects: {
            objectId: idContent,
            objectTime: time,
            objectNote: textNote,
            objectType: typeContent,
            objectIndex: objectsIndex
          }
        }
      }, { new: true })
        .then((updatedWorkflow ) => {
            console.log("addContentWorkflow successfully");
            console.log("updatedWorkflow : ", updatedWorkflow );
            res.send(updatedWorkflow);
        })
        .catch((err) => {
            console.log(err);
        });
};
