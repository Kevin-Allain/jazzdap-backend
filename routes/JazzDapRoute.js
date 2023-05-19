const {Router} = require("express")
const {getJazzDap, saveJazzDap, updateJazzDap, deleteJazzDap} = require('../controllers/JazzDapController')
const {getMusicMIDI, getSampleMIDI, getMatchLevenshteinDistance} = require('../controllers/MusicMIDIController')
const {getTrackMetadata, getTracksMetadata} = require('../controllers/MusicInfoController')
const {loginTest, loginUser, registerUser} = require ('../controllers/AuthController')
const {addAnnotation, getAnnotations, deleteAnnotation} = require ('../controllers/AnnotationController')
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

// Metadatda
router.get('/getTracksMetadata', getTracksMetadata )
router.get('/getTrackMetadata', getTrackMetadata)

// Annotations
router.post('/addAnnotation', addAnnotation )
router.get('/getAnnotations',getAnnotations)
router.post("/deleteAnnotation",deleteAnnotation)


module.exports = router;