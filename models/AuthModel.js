const mongoose = require('mongoose')

const AuthSchema = new mongoose.Schema({
    user:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
})

module.exports=mongoose.model('Auth',AuthSchema)