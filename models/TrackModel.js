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
    lognumber:{
        type: String,
        require: true
    },
    track: {
        type: String,
        require: true
    },
    trackCode: {
        type: String,
        require: true
    }
})

// Create indexes
trackSchema.index({ track: 1, m_id: 1 });
// TrackModel.createIndex({ track: 1, m_id: 1 });

module.exports = mongoose.model('Track',trackSchema)