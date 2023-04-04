const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({
    Role: {
        type: String,
        require: true
    }
})

module.exports = mongoose.model('Role', roleSchema)