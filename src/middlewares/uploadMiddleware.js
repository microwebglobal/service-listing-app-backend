const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/files";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${file.fieldname}${fileExt}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"), false);
    }
  },
});

module.exports = upload;
