const {Router} = require("express")
const {getJazzDap, saveJazzDap, updateJazzDap, deleteJazzDap} = require('../controllers/JazzDapController')
const {
    getMusicMIDI, getSampleMIDI, 
    getMatchLevenshteinDistance,
    getMatchLevenshteinDistance2,
    get_idContent_sample
} = require('../controllers/TrackController')
const {
    getTrackMetadata, getTracksMetadata, 
    get_idContent_recording, 
    get_idContent_track
} = require('../controllers/MusicInfoController')
const {loginTest, loginUser, registerUser} = require ('../controllers/AuthController')
const {
    addAnnotation, getAnnotations, deleteAnnotation, updateAnnotation, 
    get_idContent_annotation
} = require ('../controllers/AnnotationController')
const {addComment, getComments, deleteComment, updateComment, 
    get_idContent_comment} = require ('../controllers/CommentController')
const { getUserAnnotations } = require("../controllers/UserController")
const { 
    createWorkflow, getWorkflow, getWorkflowsInfo, 
    deleteWorkflow, changeTitle,  changeDescription, 
    addContentWorkflow, deleteWorkflowObject
} = require("../controllers/WorkflowController")
const router = Router()

// router.get('/',(req,res) => { res.json({message:"Hi there"})  })

// Jazzdaps
router.get('/', getJazzDap ) // TODO later on this will have to be replaced. Eventually we will have a file that will be too big
router.post('/saveJazzDap', saveJazzDap)
router.post('/updateJazzDap', updateJazzDap)
router.post('/deleteJazzDap', deleteJazzDap)

// User
router.get('/loginTest', loginTest)
router.post('/loginUser', loginUser)
router.post('/register', registerUser)

// Music
router.get('/getMusicMIDI', getMusicMIDI )
router.get('/getSampleMIDI', getSampleMIDI )
router.get('/getMatchLevenshteinDistance', getMatchLevenshteinDistance)
router.get('/getMatchLevenshteinDistance2', getMatchLevenshteinDistance2)


// Metadatda
router.get('/getTracksMetadata', getTracksMetadata )
router.get('/getTrackMetadata', getTrackMetadata)

// Annotations
router.post('/addAnnotation', addAnnotation )
router.get('/getAnnotations',getAnnotations)
router.post("/deleteAnnotation",deleteAnnotation)
router.post('/updateAnnotation', updateAnnotation)

// Comments
router.post('/addComment', addComment )
router.get('/getComments',getComments)
router.post("/deleteComment",deleteComment)
router.post('/updateComment', updateComment)

// User
router.get('/getUserAnnotations',getUserAnnotations);

// Workflow
router.get('/getWorkflow',getWorkflow)
router.get('/getWorkflowsInfo',getWorkflowsInfo);
router.post('/createWorkflow',createWorkflow);
router.post('/addContentWorkflow',addContentWorkflow);
router.post('/deleteWorkflowObject',deleteWorkflowObject);

// based on _id. One function for each type of controller
// TODO Dirty and would be better if could be changed to one line
router.get('/get_idContent_annotation', get_idContent_annotation);
router.get('/get_idContent_comment', get_idContent_comment);
router.get('/get_idContent_recording', get_idContent_recording);
router.get('/get_idContent_track', get_idContent_track);
router.get('/get_idContent_sample', get_idContent_sample);  


module.exports = router;