const mongoose = require('mongoose')

// work in progress on assessing whether this is the right method...
const commentSchema = new mongoose.Schema({
    // unsure whether we will have access to it when making the call
    annotationId: {
        type: mongoose.ObjectId,
        require: true
    },
    type: {
        type:String,
        require:true
    }, 
    info: {
        type:String,
        require:true
    },
    index:{
        type: Number,
        require:true
    },
    commentInput:{
        type:String,
        require:true
    },
    author:{
        type:String,
        require:true
    },
})

module.exports=mongoose.model('Comment',commentSchema)