const AuthModel = require('../models/AuthModel')

module.exports.loginTest = async (req, res) => {
    res.send({token:'test123'})
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
    const { user,password } = req.body;
    console.log(`req: ${req}`);
    console.log(`user: ${user}`);
    console.log(`password: ${password}`);

    AuthModel
        .create({ user,password })
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
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body:  JSON.stringify(req)
//     })
//       .then(data =>  res.send(data))
//    }
