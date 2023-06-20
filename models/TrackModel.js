const mongoose = require('mongoose')

const trackSchema = new mongoose.Schema({
    m_id: {
        type: Number,
        require: true
    },
    pitch: {
        type: Number,
        require: true
    },
    duration: {
        type: Number,
        require: true
    },
    onset: {
        type: Number,
        require: true
    },
    file: {
        type: String,
        require: true
    },
    recording: {
        type: String,
        require: true
    },
    track: {
        type: String,
        require: true
    }
})

// Create indexes
trackSchema.index({ pitch: 1 });
trackSchema.index({ recording: 1 });

module.exports=mongoose.model('Track',trackSchema)