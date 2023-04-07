// const AuthModel = require('../models/AuthModel')
const UserModel = require('../models/UserModel')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

// -- doubt about this...
const AuthModel = require('../models/AuthModel')

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

module.exports.loginTest = async (req, res) => { res.send({ token: 'test123' }) }

module.exports.loginUser = async (req, res) => {
    console.log("module.exports.loginUser");
    console.log("req.body:", JSON.stringify(req.body))
    console.log("req.headers:", JSON.stringify(req.headers))
    const { username, password } = req.body;
    try {

        var user = await UserModel.findOne({ username: username });
        if(!user) {
            return res.status(400).send({ message: "The username does not exist" });
        }
        if(!bcrypt.compare(password, user.password)) {
            return res.status(400).send({ message: "The password is invalid" });
        }
        console.log("The username and password combination is correct!");

        // -- token part
        const accessToken = jwt.sign(username, ACCESS_TOKEN_SECRET);

        // TODO verify if this makes sense!
        AuthModel.create({
            token:accessToken
        }).then((data) => {
            console.log('Wrote the accessToken. data: ',JSON.stringify(data));
        })
        .catch((err) => { console.log(err) })

        // TODO later: consider approaches for multiple roles
        res.send({ 
            message: "The username and password combination is correct!", 
            accessToken: accessToken,
            roles:['user']
        });

    } catch (error) {
        console.log("Something unexpected happened. error: ",error);
        res.status(500).send(error);
    }
}

// module.exports = router;
module.exports.registerUser = async (req, res) => {
    console.log("module.exports.registerUser");
    console.log("req.body:", JSON.stringify(req.body))
    const { user, pwd: passwordEnteredByUser, email } = req.body;
    console.log(`user: ${user}, pwd: ${passwordEnteredByUser}, email: ${email}`)

    const findOutput = await UserModel.findOne({ username: user }).sort({ _id: -1 });
    const findEmail = await UserModel.findOne({ email: email }).sort({ _id: -1 });
    if (findOutput !== null  ) {
        console.log("USER ALREADY EXISTS");
        return res.status(400).send({ message: "User already exists" });
    }
    else if ( findEmail !== null ){
        console.log("EMAIL ALREADY USED");
        return res.status(400).send({ message: "Email already used" });
    }

    UserModel
        .create({ username: user, password: passwordEnteredByUser, email:email, created_at: new Date(), roles:['user'] })
        .then((data) => {
            console.log('Registered user successfully');
            console.log(data);
            res.send(data);
        })
        .catch((err) => { console.log(err) })
}


//

/** TODO soon, will be necessary for login */
// module.exports.getHash = async (req, res) => {
//     console.log("req.body:", JSON.stringify(req.body))
//     const { user, pwd } = req.body;
//     console.log(`user: ${user}, pwd: ${pwd}`)
//     const saltRounds = 10
//     const passwordEnteredByUser = pwd;
//     const findOutput = await JazzDapModel.findOne({ username: user })
//     console.log(`findOutput: `, JSON.stringify(findOutput))
//     const foundHash = await JazzDapModel.findOne({ username: user }).select('password');
//     console.log(`foundHash: `, JSON.stringify(foundHash))
//     bcrypt.compare(passwordEnteredByUser, foundHash, function (error, isMatch) {
//         if (error) {
//             throw error
//         } else if (!isMatch) {
//             console.log("Password doesn't match!")
//         } else {
//             console.log("Password matches!")
//         }
//     })
// }

