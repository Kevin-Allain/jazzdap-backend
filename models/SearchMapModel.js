/**
 * We are setting up this system to allow for: 
 * - Saving results for queries to fasten them
 * - Save them in workflows
 * - Load content of worklows based on the resIds 
 * As of now, we are hesitating about whether it makes sense to have a single String, or several
 */
const mongoose = require('mongoose')

const searchMapSchema = new mongoose.Schema({
    query: {
        type: String,
        require: true
    },
    filterArtist:{
        type: String,
        require: true
    },
    filterRecording: {
        type: String,
        require: true
    },
    filterTrack: {
        type: String,
        require: true
    },
    resIds:{
        type:[String],
        require:true
    }
})

// Create indexes
searchMapSchema.index({ query: 1, filterArtist: 1, filterRecording: 1, filterTrack: 1 });

module.exports = mongoose.model('SearchMap',searchMapSchema);