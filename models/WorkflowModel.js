const mongoose = require('mongoose')

const workflowSchema = new mongoose.Schema({
    title: {
        type:String,
        require: true
    },
    time:{
        type:Date,
        require:true
    },
    // think of it as a Readme
    description: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true
    },
    // recoginzed by id of objects stored on the database
    objects: {
        type: [String],
        require: true
    },
    objectsTimes: {
        type: [Date],
        require: true
    }
})

module.exports=mongoose.model('Workflow',workflowSchema)