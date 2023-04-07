const mongoose = require('mongoose')

const jazzdapSchema = new mongoose.Schema({
    text:{
        type:String,
        require:true
    },
    users:{
        type:[String],
        require:true
    }
})

module.exports=mongoose.model('JazzDap',jazzdapSchema)