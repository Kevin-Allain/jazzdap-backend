const AudioSlicerModel = require("../models/AudioSlicerModel"); // not useful...

// const bodyParser = require('body-parser');
// const ffmpeg = require('fluent-ffmpeg');
// const path = require('path');
// const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises; // Node.js built-in 'promises' version of fs
const cutter = require('mp3-cutter');

// Function to handle audio slicing
const sliceMp3 = async (file,start,end, pathFolderOutput=process.cwd()) => {
    console.log("-+- getSliceMp3 -+-");
    console.log({file,start,end});

    console.log("-- PATHS");
    console.log("__dirname: ",__dirname);
    console.log("process.cwd(): ",process.cwd());
    console.log("pathFolderOutput: ", pathFolderOutput);
    console.log("--");

    try {
        const inputFile = path.join(process.cwd(),'audio_files','test_audio.mp3');
        console.log("inputFile: ",inputFile);
        const outputFileName = (file !== '')
            ? `${file}_${start}_${end}.mp3`
            : `sliced_audio_${start}_${end}.mp3`;
        console.log("outputFileName: ",outputFileName);
        const outputFile = path.join(pathFolderOutput, 'public', outputFileName);
        console.log("outputFile: ",outputFile);

        // Use mp3-cutter to perform the audio slice
        cutter.cut({
            src: inputFile,
            target: outputFile,
            start,
            end,
        });

        return outputFile;
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
        const slicedAudioPath = await sliceMp3(file, start, end);
        console.log('Audio sliced successfully');
        res.json({ success: true, slicedAudioPath });
    } catch (error) {
        console.error('Error processing audio slice request', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
