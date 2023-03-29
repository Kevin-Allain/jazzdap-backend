const AuthModel = require('../models/AuthModel')
const UserModel = require('../models/UserModel')
const bcrypt = require("bcryptjs")


module.exports.loginTest = async (req, res) => {
    res.send({ token: 'test123' })
}

// module.exports.loginUser = async (req, res) => {

//     var keys = Object.keys(req);
//     var keys2 = Object.keys(req.body);

//     console.log(`keys2: ${keys2}`);
//     // console.log(`req.body: ${req.body}`);

//     const { username, password } = req.body;
//     // console.log(`username: ${username}, password: ${password}`);

//     // TODO looks dirty
//     return fetch('http://localhost:5000/loginUser', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({username,password})
//       })
//         .then(data => data.json())
// }

// module.exports = router;
module.exports.loginUser = async (req, res) => {
    console.log("req: ");
    console.log(JSON.stringify(req))
    console.log("req.body:");
    console.log(JSON.stringify(req.body))
    const { user, password } = req.body;
    console.log(`req: ${req}`);
    console.log(`user: ${user}`);
    console.log(`password: ${password}`);

    AuthModel
        .create({ user, password })
        .then((data) => {
            console.log('Added successfully')
            console.log(data)
            res.send(data)
        })
}

// async function loginUser(req,res) {
//     console.log(`loginUser AuthController. credentials: ${req}`);
//     return fetch( `${baseUrl}/loginUser` , {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body:  JSON.stringify(req)
//     })
//       .then(data =>  res.send(data))
//    }

// module.exports = router;
module.exports.registerUser = async (req, res) => {
    console.log("req.body:", JSON.stringify(req.body))
    const { user, pwd } = req.body;
    console.log(`user: ${user}, pwd: ${pwd}`)
    const saltRounds = 10

    bcrypt.genSalt(saltRounds, function (saltError, salt) {
        if (saltError) {
            throw saltError
        } else {
            bcrypt.hash(pwd, salt, async function (hashError, hash) {
                if (hashError) {
                    throw hashError
                } else {
                    console.log("hash: ", hash) // e.g.: $2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K

                    // ----
                    const passwordEnteredByUser = pwd;

                    const findOutput = await UserModel.findOne({ username: user })
                    if (findOutput !== null) {
                        console.log(`findOutput: `, JSON.stringify(findOutput))
                        const foundHash = await UserModel.findOne({ username: user }).select('password');
                        console.log(`foundHash.password: `, JSON.stringify(foundHash.password))
                        const foundPwd = foundHash.password;

                        bcrypt.compare(passwordEnteredByUser, foundPwd, function (error, isMatch) {
                            if (error) {
                                throw error
                            } else if (!isMatch) {
                                console.log("Password doesn't match!")
                            } else {
                                console.log("Password matches!")
                            }
                        })
                    }
                    // ----


                    // ####
                    bcrypt.hash('mypassword', 10, function (err, hash) {
                        if (err) { throw (err); }

                        bcrypt.compare('mypassword', hash, function (err, result) {
                            if (err) { throw (err); }
                            console.log("IS NORMAL HASH WORKING AS EXPECTED WHEN COMPARED? ", result);
                        });
                    });
                    // ###                    


                    UserModel
                        .create({ username: user, password: hash })
                        .then((data) => {
                            console.log('Registered user successfully')
                            console.log(data)
                            res.send(data)
                        })
                        .catch((err) => { console.log(err) })
                }
            })
        }
    })
}


// module.exports = {
//     createANewUser: function(username, password, callback) {
//       const newUserDbDocument = new UserModel({
//         username: username,
//         password: password
//       })
//       newUserDbDocument.save(function(error) {
//         if (error) {
//           callback({error: true})
//         } else {
//           callback({success: true})
//         }
//       })
//     }
//   }


module.exports.getHash = async (req, res) => {
    console.log("req.body:", JSON.stringify(req.body))
    const { user, pwd } = req.body;
    console.log(`user: ${user}, pwd: ${pwd}`)
    const saltRounds = 10

    const passwordEnteredByUser = pwd;

    const findOutput = await JazzDapModel.findOne({ username: user })
    console.log(`findOutput: `, JSON.stringify(findOutput))

    const foundHash = await JazzDapModel.findOne({ username: user }).select('password');
    console.log(`foundHash: `, JSON.stringify(foundHash))


    const hash = "TODO GET HASH";

    bcrypt.compare(passwordEnteredByUser, foundHash, function (error, isMatch) {
        if (error) {
            throw error
        } else if (!isMatch) {
            console.log("Password doesn't match!")
        } else {
            console.log("Password matches!")
        }
    })


}