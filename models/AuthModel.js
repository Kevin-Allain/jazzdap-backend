const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    token : {
        type:String,
        require:true
    },
    created_at: {
        type: Date,
        require: true
    },
    username: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('Auth', authSchema)