const JazzDapModel = require("../models/JazzDapModel");

module.exports.getJazzDap = async (req, res) => {
  console.log("---module.exports.getJazzDap---, req.headers: ",req.headers);
  const jazzDap = await JazzDapModel.find();
  res.send(jazzDap);
};

// module.exports = router;
module.exports.saveJazzDap = async (req, res) => {
  console.log(
    "module.exports.saveJazzDap. req.headers: ",
    req.headers
  );
  const { text, user } = req.body;

  JazzDapModel.create({ text: text, users: user })
    .then((data) => {
      console.log("Added successfully");
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.updateJazzDap = async (req, res) => {
  const { _id, text, userId } = req.body;

  console.log( "module.exports.updateJazzDap. req.body: ",req.body);

  JazzDapModel.findByIdAndUpdate(_id, {
    $set: { text: text },
    $push: { users: userId },
  })
    .then(() => {
      console.log("Updated successfully");
      res.send("Updated successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports.deleteJazzDap = async (req, res) => {
  console.log( "module.exports.deleteJazzDap. req.body: ",req.body);

  const { _id } = req.body;

  // Convert the string _id to a valid ObjectId
  console.log("_id: ",_id,", typeof _id: ",(typeof _id))


  JazzDapModel.findByIdAndDelete(_id)
    .then(() => {
      console.log("Deleted successfully");
      res.send("Deleted successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
