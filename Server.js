const express = require('express')
const mongoose = require('mongoose')
const cors=require('cors')
require('dotenv').config()


const routes = require('./routes/JazzDapRoute')

const app = express()
const PORT = process.env.port || 5000

app.use(express.json())
app.use(cors())

mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log(`Connected to MongoDB`);
        // initial();        
    })
    .catch((err) => {console.log(`Error: `,err)})

app.use(routes)
console.log(`Routes ${routes}`)


// ---- Not working as is... Would need to strongly chnage structure, and I would rather avoid it
// function initial() {
//     Role.estimatedDocumentCount((err, count) => {
//       if (!err && count === 0) {
//         new Role({
//           name: "user"
//         }).save(err => {
//           if (err) {
//             console.log("error", err);
//           }
  
//           console.log("added 'user' to roles collection");
//         });
  
//         new Role({
//           name: "moderator"
//         }).save(err => {
//           if (err) {
//             console.log("error", err);
//           }
  
//           console.log("added 'moderator' to roles collection");
//         });
  
//         new Role({
//           name: "admin"
//         }).save(err => {
//           if (err) {
//             console.log("error", err);
//           }
  
//           console.log("added 'admin' to roles collection");
//         });
//       }
//     });
//   }
// ----


app.listen(PORT, () => console.log(`Listening on ${PORT}`))