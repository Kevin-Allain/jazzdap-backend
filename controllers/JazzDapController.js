const JazzDapModel = require("../models/JazzDapModel");

module.exports.getJazzDap = async (req, res) => {
  console.log("---module.exports.getJazzDap---");
  const jazzDap = await JazzDapModel.find();
  res.send(jazzDap);
};

// module.exports = router;
module.exports.saveJazzDap = async (req, res) => {
  console.log(
    "module.exports.saveJazzDap. req.headers: ",
    JSON.stringify(req.headers)
  );
  const { text, user } = req.body;

  // TODO change according to users recognized in request
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

  console.log(JSON.stringify(req.body));

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
  const { _id } = req.body;

  // TODO change according to users recognized in request... and consider who can do what?! Admin to remove queries?

  JazzDapModel.findByIdAndDelete(_id)
    .then(() => {
      console.log("Deleted successfully");
      res.send("Deleted successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
