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
    // recoginzed by _id of objects stored on the database
    objects: {
        type: [
          {
            objectId: String,
            objectTime: Date,
            objectIndex: Number,
            objectNote: String,
            objectType: String
          }
        ],
        require: true
      }    
})

module.exports=mongoose.model('Workflow',workflowSchema)