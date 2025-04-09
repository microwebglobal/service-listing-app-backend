const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image/pdf files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
