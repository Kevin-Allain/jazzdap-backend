const mongoose = require('mongoose')

const annotationSchema = new mongoose.Schema({
    type: {
        type:String,
        require:true
    },
    info: {
        type:String,
        require:true
    },
    indexAnnotation:{
        type: Number,
        require:true
    },
    annotationInput:{
        type:String,
        require:true
    },
    author:{
        type:String,
        require:true
    },
    privacy:{
        type:String,
        require:true
    },
    starred_by:{
        type:[String],
        require:true
    },
    collaborators:{
        type:[String],
        require:true
    },
    comments:{
        type:[String],
        require:true
    },
    time:{
        type:Date,
        require:true
    },
    objectId: {
        type: String
    }
})

module.exports=mongoose.model('Annotation',annotationSchema)