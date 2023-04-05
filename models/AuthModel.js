const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
    token : {
        type:String,
        require:true
    }
})

module.exports = mongoose.model('Auth', authSchema)