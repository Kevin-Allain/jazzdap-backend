const {Router} = require("express")
const {getJazzDap, saveJazzDap, updateJazzDap, deleteJazzDap} = require('../controllers/JazzDapController')
const {loginTest, loginUser} = require ('../controllers/AuthController')
const router = Router()

// router.get('/',(req,res) => { res.json({message:"Hi there"})  })

router.get('/', getJazzDap ) // TODO later on this will have to be replaced. Eventually we will have a file that will be too big
router.post('/save', saveJazzDap)
router.post('/update', updateJazzDap)
router.post('/delete', deleteJazzDap)

router.get('/loginTest', loginTest)
router.post('/loginUser', loginUser)

module.exports = router;