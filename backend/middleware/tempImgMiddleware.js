const path = require("path");
const util=require('util');
const multer= require('multer');

//Setting storage engine
const storageEngine = multer.diskStorage({
    destination: path.join(path.dirname(process.mainModule.filename),'tempFaceData'),
    filename: (req, file, cb) => {
      cb(null, `${req.user._id}${path.extname(file.originalname)}`);
    },
  });


const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};


//Middleware
const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        console.log('imageHandler is here')
      checkFileType(file, cb);
    },
}).single('facepic');

module.exports.uploadtempfile=util.promisify(upload);
