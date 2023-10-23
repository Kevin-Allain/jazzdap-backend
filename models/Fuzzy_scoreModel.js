const mongoose = require('mongoose')

const fuzzy_scoreSchema = new mongoose.Schema({
    m_id: {
        type:Number,
        require: true
    },
    pitch: {
        type:Number,
        require: true
    },
    duration: {
        type:Number,
        require: true
    },
    onset: {
        type:Number,
        require: true
    },
    lognumber: {
        type:String,
        require: true
    },
    trackCode: {
        type:String,
        require: true
    },
    track: {
        type:String,
        require: true
    },
    fuzzyRange1: {
        type:Number,
        require: true
    },
    fuzzyRange2: {
        type:Number,
        require: true
    },
    fuzzyRange3: {
        type:Number,
        require: true
    },
    fuzzyRange4: {
        type:Number,
        require: true
    },
    fuzzyRange5: {
        type:Number,
        require: true
    },
    fuzzyRange6: {
        type:Number,
        require: true
    },
    fuzzyRange7: {
        type:Number,
        require: true
    },
    fuzzyRange8: {
        type:Number,
        require: true
    },
    fuzzyRange9: {
        type:Number,
        require: true
    },
    fuzzyRange10: {
        type:Number,
        require: true
    },
    fuzzyRange11: {
        type:Number,
        require: true
    },
    fuzzyRange12: {
        type:Number,
        require: true
    },
    fuzzyRange13: {
        type:Number,
        require: true
    },
    fuzzyRange14: {
        type:Number,
        require: true
    },
    fuzzyRange15: {
        type:Number,
        require: true
    },
    first_id: {
        type:String,
        require: true
    }
})

fuzzy_scoreSchema.index({ first_id: 1 });

module.exports=mongoose.model('Fuzzy_score',fuzzy_scoreSchema)
