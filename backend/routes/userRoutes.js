const express = require('express');
const {registerUser,postFacedata,authUser, allUsers}=require('../controllers/userControllers');
const {protect,verifyFacedata} =require("../middleware/authMiddleware")
const multer  = require('multer')
const upload = multer({ dest: '../faceData' })

const router = express.Router()

router.route('/').post(registerUser).get(protect, allUsers);
router.route('/login').post(authUser);
router.route('/faceverification').post(protect,postFacedata);
router.route('/faceverification/verify').post(protect,verifyFacedata);
module.exports  = router;