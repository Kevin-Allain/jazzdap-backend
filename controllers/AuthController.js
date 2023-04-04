const AuthModel = require('../models/AuthModel')
const UserModel = require('../models/UserModel')
const bcrypt = require("bcryptjs")

module.exports.loginTest = async (req, res) => { res.send({ token: 'test123' }) }

module.exports.loginUser = async (req, res) => {
    console.log("module.exports.loginUser");
    console.log("req.body:", JSON.stringify(req.body))
    const { username, password } = req.body;
    try {
        var user = await UserModel.findOne({ username: username });
        console.log("user: ",user);
        if(!user) {
            console.log("The username does not exist")
            return res.status(400).send({ message: "The username does not exist" });
        }
        if(!bcrypt.compare(password, user.password)) {
            console.log("The password is invalid")
            return res.status(400).send({ message: "The password is invalid" });
        }
        console.log("The username and password combination is correct!");
        res.send({ message: "The username and password combination is correct!" });
    } catch (error) {
        console.log("Something unexpected happened. error: ",error);
        res.status(500).send(error);
    }
}

// async function loginUser(req,res) { console.log(`loginUser AuthController. credentials: ${req}`); return fetch( `${baseUrl}/loginUser` , { method: 'POST', headers: { 'Content-Type': 'application/json' }, body:  JSON.stringify(req) }) .then(data =>  res.send(data)) }

// module.exports = router;
module.exports.registerUser = async (req, res) => {
    console.log("module.exports.registerUser");
    console.log("req.body:", JSON.stringify(req.body))
    const { user, pwd: passwordEnteredByUser, email } = req.body;
    console.log(`user: ${user}, pwd: ${passwordEnteredByUser}, email: ${email}`)

    const findOutput = await UserModel.findOne({ username: user }).sort({ _id: -1 });
    const findEmail = await UserModel.findOne({ email: email }).sort({ _id: -1 });
    if (findOutput !== null  ) {
        // // Bit of code to keep an reuse for login...
        // console.log(`findOutput: `, JSON.stringify(findOutput))
        // const foundHash = await UserModel.findOne({ username: user }).select('password');
        // console.log(`foundHash.password: `, JSON.stringify(foundHash.password))
        // bcrypt.compare(passwordEnteredByUser, foundHash.password, function (err, result) { console.log("#### passwordEnteredByUser and foundHash.password match ", result); })
        console.log("USER ALREADY EXISTS");
        return res.status(400).send({ message: "User already exists" });
    }
    else if ( findEmail !== null ){
        console.log("EMAIL ALREADY USED");
        return res.status(400).send({ message: "Email already used" });
    }

    UserModel
        .create({ username: user, password: passwordEnteredByUser, email:email, created_at: new Date() })
        .then((data) => {
            console.log('Registered user successfully');
            console.log(data);
            // console.log("data.password: ", data.password, ", passwordEnteredByUser: ", passwordEnteredByUser); console.log("data.password === passwordEnteredByUser: ", data.password === passwordEnteredByUser);
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