const AudioSlicerModel = require("../models/AudioSlicerModel"); // not useful...
const MusicInfoControllerModel = require("../models/TrackMetadataModel");

// const bodyParser = require('body-parser');
// const ffmpeg = require('fluent-ffmpeg');
// const path = require('path');
// const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises; // Node.js built-in 'promises' version of fs
const cutter = require('mp3-cutter');


// Function to handle audio slicing
const sliceMp3 = async (fileName, start, end, pathFolderOutput = process.cwd()) => {
    console.log("-+- getSliceMp3 -+-");
    console.log({ fileName, start, end });

    console.log("-- PATHS");
    console.log("__dirname: ", __dirname);
    console.log("process.cwd(): ", process.cwd());
    console.log("pathFolderOutput: ", pathFolderOutput);
    console.log("--");

    try {
        const inputFile = path.join(process.cwd(), 'audio_files', fileName + '.mp3');
        console.log("inputFile: ", inputFile);
        const outputFileName = (fileName !== '')
            ? `${fileName}_${start}_${end}.mp3`
            : `sliced_audio_${start}_${end}.mp3`;
        console.log("outputFileName: ", outputFileName);

        const outputFile = path.join(pathFolderOutput, 'public', outputFileName);
        console.log("outputFile: ", outputFile);

        const splitsFile = outputFile.split('\\'); // TODO doubt about running this on the Red Hat server. Might be a '/' character.
        // We only care about the last element
        const lastSplit = splitsFile.at(-1);
        // Check if the output file already exists
        try {
            await fs.access(outputFile);
            console.log("Output file already exists. Returning existing file path.");
            return lastSplit;
        } catch (notFoundError) {
            // Output file doesn't exist, proceed with slicing
            console.log("Output file doesn't exist. Proceeding with slicing.");
            // Use mp3-cutter to perform the audio slice
            cutter.cut({ src: inputFile, target: outputFile, start, end, });
            console.log('Audio sliced successfully');
            // return outputFile;
            return lastSplit;
        }
    } catch (error) {
        console.error('Error slicing audio', error);
        throw error;
    }
};

// Route using the exported function
module.exports.getSliceMp3 = async (req, res) => {
    const { file, start, end } = req.query;
    console.log("modeule exports getSliceMp3: ", { file, start, end });
    try {
        // First: verify the existence of the folder
        // Second: verify the existence of the file
        // if file exists, set slicedAudioPath as the new sliceMp3
        // otherwise, create slice of the mp3
        const slicedAudio = await sliceMp3(file, start, end);
        console.log('Audio sliced successfully');
        res.send({ success: true, slicedAudio });
    } catch (error) {
        console.error('Error processing audio slice request', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports.doesMp3exist = async (req, res) => {
  const { sja_id } = req.query;
  console.log("-+- doesMp3exist -+- sja_id: ", sja_id);
  // Construct the assumed directory structure for local files
  const audioFilesDirectory = path.join(process.cwd(), "audio_files");
  // Extract sja_id from the request query parameters
  // 1 - Check if there is a file with sja... .mp3 locally
  const localFilePath = path.join(audioFilesDirectory, `${sja_id}.mp3`);
  console.log("localFilePath: ",localFilePath);
  try {
    await fs.access(localFilePath);
    console.log("Local file exists. Returning true.");
    res.json({ exists: true });
  } catch (localFileNotFoundError) {
    console.log("Local file does not exist. Proceeding with database search.");
    // 2 - Search in the database with the MusicInfoControllerModel
    try {
      const data = await MusicInfoControllerModel.find({ SJA_ID: sja_id });
      console.log("Searched successfully MusicInfoControllerModel.find");
      console.log("data.length: ", data.length);
      // Check if there is at least one result and get the value of "Audio Filename (Internal backup)"
      const audioFilename =
        data.length > 0 ? data[0]._doc['Audio Filename (Internal backup)'] : null;
      console.log("audioFilename: ",audioFilename);
      if (audioFilename) {
        // Construct the local file path based on the assumed directory structure
        const databaseLocalFilePath = path.join(audioFilesDirectory, audioFilename);
        // Check if the local file exists
        try {
          await fs.access(databaseLocalFilePath);
          console.log("Local file exists. Returning true.");
          res.send({ exists: true });
        } catch (databaseLocalFileNotFoundError) {
          console.log("Local file does not exist. Returning false.");
          res.send({ exists: false });
        }
      } else {
        console.log( "Audio filename not found in the database. Returning false." );
        res.send({ exists: false });
      }
    } catch (error) {
      console.error("Error querying MusicInfoControllerModel:", error);
      res.status(500).send({ error: "Internal server error" });
    }
  }
};

module.exports.doMp3exist = async (req, res) => {
  const { sja_ids } = req.query;
  console.log("-+- doesMp3exist -+- sja_ids: ", sja_ids);
  // Construct the assumed directory structure for local files
  const audioFilesDirectory = path.join(process.cwd(), "audio_files");
  const objectSja_exists = {};
  for (let i in sja_ids) {
    const sja_id = sja_ids[i];
    // Extract sja_id from the request query parameters
    // 1 - Check if there is a file with sja... .mp3 locally
    const localFilePath = path.join(audioFilesDirectory, `${sja_id}.mp3`);
    console.log("localFilePath: ", localFilePath);
    try {
      await fs.access(localFilePath);
      console.log("Local file exists. Returning true.");
      // res.json({ exists: true });
      objectSja_exists[sja_id] = true;
    } catch (localFileNotFoundError) {
      console.log(
        "Local file does not exist. Proceeding with database search."
      );
      // 2 - Search in the database with the MusicInfoControllerModel
      try {
        const data = await MusicInfoControllerModel.find({ SJA_ID: sja_id });
        console.log("Searched successfully MusicInfoControllerModel.find");
        console.log("data.length: ", data.length);
        // Check if there is at least one result and get the value of "Audio Filename (Internal backup)"
        const audioFilename = data.length > 0 ? data[0]._doc["Audio Filename (Internal backup)"] : null;
        console.log("audioFilename: ", audioFilename);
        if (audioFilename) {
          // Construct the local file path based on the assumed directory structure
          const databaseLocalFilePath = path.join(audioFilesDirectory,audioFilename);
          // Check if the local file exists
          try {
            await fs.access(databaseLocalFilePath);
            // console.log("Local file exists. Returning true.");
            // res.send({ exists: true });
            objectSja_exists[sja_id] = true;
          } catch (databaseLocalFileNotFoundError) {
            // console.log("Local file does not exist. Returning false.");
            // res.send({ exists: false });
            objectSja_exists[sja_id] = false;
          }
        } else {
          console.log( "Audio filename not found in the database. Returning false." ); 
          // res.send({ exists: false });
          objectSja_exists[sja_id] = false;
        }
      } catch (error) {
        console.error("Error querying MusicInfoControllerModel:", error);
        res.status(500).send({ error: "Internal server error" });
      }
    }
  }
    res.send({objectsExist: objectSja_exists});
};
