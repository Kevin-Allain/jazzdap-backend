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
        console.log("AuthController, loginUser: The username and password combination is correct!");

        console.log("Do we have access to the ACCESS_TOKEN_SECRET? Its type is: ",(typeof ACCESS_TOKEN_SECRET));
        // -- token part
        // expiration time of 1 hour
        // const accessToken = jwt.sign(username, ACCESS_TOKEN_SECRET,  { expiresIn: '1h' });
        const accessToken = jwt.sign(username, ACCESS_TOKEN_SECRET);

        // TODO verify if this makes sense!
        AuthModel.create({
            token:accessToken,
            username: username,
            created_at: new Date()
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


