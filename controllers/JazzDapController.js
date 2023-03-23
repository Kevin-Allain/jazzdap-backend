const JazzDapModel = require('../models/JazzDapModel')

module.exports.getJazzDap = async (req, res) => {
    const jazzDap = await JazzDapModel.find()
    res.send(jazzDap)
}

// module.exports = router;
module.exports.saveJazzDap = async (req, res) => {
    const { text } = req.body;
    JazzDapModel
        .create({ text })
        .then((data) => {
            console.log('Added successfully')
            console.log(data)
            res.send(data)
        })
}

module.exports.updateJazzDap = async (req, res) => {
    const { _id, text } = req.body;
    JazzDapModel
        .findByIdAndUpdate(_id, {text} )
        .then(() => {
            console.log('Updated successfully')
            res.send("Updated successfully")})
        .catch((err) => {console.log(err)} ) 
}

module.exports.deleteJazzDap = async (req, res) => {
    const { _id } = req.body;
    JazzDapModel
        .findByIdAndDelete(_id )
        .then(() => {
            console.log('Deleted successfully')
            res.send("Deleted successfully")})
        .catch((err) => {console.log(err)} ) 
}