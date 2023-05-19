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
    annotationInput:{
        type:String,
        require:true
    },
    user:{
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
    }
    // TODO think about colaboration for annotations
    // collaborators:{
    //     type:[String],
    //     require:true
    // },
})

module.exports=mongoose.model('Annotation',annotationSchema)