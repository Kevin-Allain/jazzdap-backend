const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    created_at: {
        type: Date,
        require: true
    }
})

userSchema.pre("save", function (next) {
    const user = this;
    if (this.isModified("password") || this.isNew) {
        console.log("this.isModified or this.isNew");
        bcrypt.genSalt(10, function (saltError, salt) {
            if (saltError) {
                return next(saltError);
            } else {
                bcrypt.hash(user.password, salt, function (hashError, hash) {
                    if (hashError) { return next(hashError) }
                    user.password = hash;
                    next();
                })
            }
        })
    } else {
        console.log("else userSchema.pre")
        return next()
    }
})

module.exports = mongoose.model('User', userSchema)