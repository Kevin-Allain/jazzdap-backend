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
    privacy: {
      type: String,
      require: true
    },
    // Will need to set more detailed things 
    // arrMeta:{
    //   type:Object,
    // },
    arrTrackTitle:{
      type:[String],
    },
    arrEventName:{
      type:[String],
    },
    arrNamedArtists:{
      type:[String],
    },
    arrReleaseYear:{
      type:[Number],
    },
    arrReleaseMonth:{
      type:[Number],
    },
    // recoginzed by _id of objects stored on the database
    objects: {
        type: [
          {
            objectId: String,
            objectTime: Date,
            objectIndex: Number,
            objectNote: String,
            objectType: String,
            // the type "sample" is complicated... We need a range selection.
            objectIndexRange:Number,
          }
        ],
        require: true
      }
})

module.exports=mongoose.model('Workflow',workflowSchema)