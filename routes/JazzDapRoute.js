const {Router} = require("express")
const {getJazzDap, saveJazzDap, updateJazzDap, deleteJazzDap} = require('../controllers/JazzDapController')
const {getMusicMIDI, getSampleMIDI, getMatchLevenshteinDistance} = require('../controllers/MusicMIDIController')
const {loginTest, loginUser, registerUser} = require ('../controllers/AuthController')
const router = Router()

// router.get('/',(req,res) => { res.json({message:"Hi there"})  })

router.get('/', getJazzDap ) // TODO later on this will have to be replaced. Eventually we will have a file that will be too big
router.post('/save', saveJazzDap)
router.post('/update', updateJazzDap)
router.post('/delete', deleteJazzDap)

router.get('/loginTest', loginTest)
router.post('/loginUser', loginUser)
router.post('/register', registerUser)


router.get('/getMusicMIDI', getMusicMIDI )
router.get('/getSampleMIDI', getSampleMIDI )
router.get('/getMatchLevenshteinDistance', getMatchLevenshteinDistance)


module.exports = router;