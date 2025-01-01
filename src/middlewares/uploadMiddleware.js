// middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname); 
    const fileName = `${Date.now()}${fileExt}`; 
    cb(null, fileName); 
  }
});


const upload = multer({
  storage: storage,
  
}); 


module.exports = upload;
