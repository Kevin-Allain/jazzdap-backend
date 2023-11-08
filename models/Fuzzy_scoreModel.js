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
    _idRange1: {
        type:Number,
        require: true
    },
    _idRange2: {
        type:Number,
        require: true
    },
    _idRange3: {
        type:Number,
        require: true
    },
    _idRange4: {
        type:Number,
        require: true
    },
    _idRange5: {
        type:Number,
        require: true
    },
    _idRange6: {
        type:Number,
        require: true
    },
    _idRange7: {
        type:Number,
        require: true
    },
    _idRange8: {
        type:Number,
        require: true
    },
    _idRange9: {
        type:Number,
        require: true
    },
    _idRange10: {
        type:Number,
        require: true
    },
    _idRange11: {
        type:Number,
        require: true
    },
    _idRange12: {
        type:Number,
        require: true
    },
    _idRange13: {
        type:Number,
        require: true
    },
    _idRange14: {
        type:Number,
        require: true
    },
    _idRange15: {
        type:Number,
        require: true
    },
    first_id: {
        type:String,
        require: true
    }
})

// Need to consider how many indexes can be valuable for speed increase
fuzzy_scoreSchema.index({ 
    lognumber: 1,
    // first_id: 1,  
    // fuzzyRange4:1,
    // fuzzyRange5:1,
    // fuzzyRange6:1,
    // fuzzyRange7:1,
    // fuzzyRange8:1,
    // fuzzyRange9:1,
    // fuzzyRange10:1,
    // fuzzyRange11:1,
    // fuzzyRange12:1,
    // fuzzyRange13:1,
});

module.exports = mongoose.model('Fuzzy_score',fuzzy_scoreSchema)
