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
    const { user, pwd: passwordEnteredByUser } = req.body;
    console.log(`user: ${user}, pwd: ${passwordEnteredByUser}`)
    const saltRounds = 10

    // bcrypt.genSalt(saltRounds, function (saltError, salt) {
    //     if (saltError) {
    //         throw saltError
    //     } else {

    bcrypt.hash(passwordEnteredByUser, saltRounds, async function (hashError, generatedHash) {
        if (hashError) { throw hashError }
        console.log("generatedHash: ", generatedHash) // e.g.: $2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
        console.log("generatedHash.length: ", generatedHash.length)

        // ---- Password matching database
        const findOutput = await UserModel.findOne({ username: user }).sort({ _id: -1 });
        if (findOutput !== null) {
            console.log(`findOutput: `, JSON.stringify(findOutput))
            const foundHash = await UserModel.findOne({ username: user }).select('password');
            console.log(`foundHash.password: `, JSON.stringify(foundHash.password))
            const foundPwd = String(foundHash.password);

            // ----
            // #### hashItself match
            bcrypt.compare(passwordEnteredByUser, generatedHash, function (err, result) { console.log("#### hashItself match ", result); })
            // ####
            // // +++++ test with written password
            // const pwd8888 = "Pwd!8888"
            // const isPwdTest = passwordEnteredByUser === pwd8888;
            // console.log(`isPwdTest:`, isPwdTest);
            // const testPwd_8888_1 = "$2a$10$IdGfszkEGetEzCRThCJ0l.fT7RmsjFlcvmPBgzyLWCnIiGEgF1tXC"
            // console.log("+++++ testPwd_8888_1.length: ", testPwd_8888_1.length);
            const testPwd_8888_2 = "$2a$10$OuKMiLSwWRyyVKNucTQU6O8SfC57XExB/5J3MaPad7XQyS..DmS8."
            // console.log("+++++ testPwd_8888_2.length: ", testPwd_8888_2.length);
            // bcrypt.hash(pwd8888, saltRounds, function (err2, hash8888) {
            //     console.log("hash8888: ", hash8888);
            //     console.log("hash8888.length: ", hash8888.length);
            //     if (err2) { throw (err2); }
            //     bcrypt.compare(pwd8888, hash8888, function (err, result) {
            //         if (err) { throw (err); }
            //         console.log("Hash 8888_1 match ", result);
            //     });
            //     bcrypt.compare(pwd8888, testPwd_8888_1, function (err, result) {
            //         if (err) { throw (err); }
            //         console.log("testPwd_8888_1 match ", result);
            //     });
            //     bcrypt.compare(pwd8888, testPwd_8888_2, function (err, result) {
            //         if (err) { throw (err); }
            //         console.log("testPwd_8888_2 match ", result);
            //     });
            //     bcrypt.compare(passwordEnteredByUser, hash8888, function (err, result) {
            //         if (err) { throw (err); }
            //         console.log("match passwordEnteredByUser and hash8888 match ", result);
            //     });
            // });
            // // +++++

            // ~~~~ double hash
            bcrypt.hash(passwordEnteredByUser, saltRounds, async function (hashError2, hash2) {
                if (hashError2) { throw hashError2 }
                bcrypt.compare(passwordEnteredByUser, hash2, function (err, result) {
                    if (err) { throw (err); }
                    console.log("~~~~ match passwordEnteredByUser and hash2 match ", result);
                });
            })
            // ~~~~
            // ¬¬¬¬ About passwordEnteredByUser
            const string_passwordEnteredByUser = String(passwordEnteredByUser);
            console.log("string_passwordEnteredByUser === passwordEnteredByUser", string_passwordEnteredByUser === passwordEnteredByUser)
            bcrypt.hash(string_passwordEnteredByUser, saltRounds, async function (hashError2, hash2) {
                if (hashError2) { throw hashError2 }
                bcrypt.compare(passwordEnteredByUser, hash2, function (err, result) {
                    if (err) { throw (err); }
                    console.log("¬¬¬¬ match string_passwordEnteredByUser and hash2 match ", result);
                });
            })
            // ¬¬¬¬

            // ¦¦¦¦ Copied object from the database
            const copiedObject = { "_id": { "$oid": "64245158cec24d6bc876da71" }, "username": "testPwd_8888", "password": "$2a$10$OuKMiLSwWRyyVKNucTQU6O8SfC57XExB/5J3MaPad7XQyS..DmS8.", "__v": { "$numberInt": "0" } }
            bcrypt.compare(passwordEnteredByUser, copiedObject.password, function (err, result) {
                if (err) { throw (err); }
                console.log("¦¦¦¦ match passwordEnteredByUser and copiedObject.password match ", result);
                console.log("¦¦¦¦ testPwd_8888_2 same as copiedObject.password?: ", copiedObject.password === testPwd_8888_2);
                console.log("¦¦¦¦ foundPwd same as copiedObject.password: ", copiedObject.password === foundPwd);
            });
            // ¦¦¦¦

            console.log("what is this.password: ", JSON.stringify(this.password));

            bcrypt.compare(passwordEnteredByUser, foundPwd, function (error, isMatch) {
                if (error) {
                    throw error
                } else if (!isMatch) {
                    console.log("-> Password doesn't match!")
                } else {
                    console.log("-> Password matches!")
                }
            })
        }

        UserModel
            .create({ username: user, password: generatedHash })
            .then((data) => {
                console.log('Registered user successfully');
                console.log(data);
                console.log("data.password: ",data.password,", generatedHash: ",generatedHash);
                console.log("data.password === generatedHash: ", data.password === generatedHash);
                res.send(data);
            })
            .catch((err) => { console.log(err) })

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