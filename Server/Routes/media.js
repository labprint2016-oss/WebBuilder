const express = require("express");
const multer = require("../MiddleWare/manageImg");
const multerLib = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const uploadDirPath = path.join(__dirname, "../uploads");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v", ".avi"]);
const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
  "video/x-msvideo",
]);

const mediaStorage = multerLib.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "<>" + file.originalname);
  },
});

const mediaUpload = multerLib({
  storage: mediaStorage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MEDIA_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(
      new Error(
        "Only image/video files are allowed! (.jpeg, .jpg, .png, .webp, .gif, .mp4, .webm, .ogg, .mov, .m4v, .avi)"
      ),
      false
    );
  },
});

const getFileExtension = (fileName) => path.extname(String(fileName || "")).toLowerCase();
const listFilesByExtension = (extensionsSet) => {
  if (!fs.existsSync(uploadDirPath)) return [];
  return fs
    .readdirSync(uploadDirPath)
    .filter((fileName) => extensionsSet.has(getFileExtension(fileName)))
    .reverse();
};
const listMediaFiles = () => {
  if (!fs.existsSync(uploadDirPath)) return [];
  return fs
    .readdirSync(uploadDirPath)
    .filter((fileName) => {
      const ext = getFileExtension(fileName);
      return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
    })
    .reverse();
};

router.post("/uploadImage", multer, (req, res) => {
  try {
    res.send(req.file);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
});

router.get("/listImages", (req, res) => {
  try {
    res.send(listFilesByExtension(IMAGE_EXTENSIONS));
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
});

router.get("/getImage/:filename", async (req, res) => {
  try {
    const dirPath = path.join(__dirname, "../uploads");
    const filename = req.params.filename;
    const filePath = path.join(dirPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("Not Found");
    }
    res.send(filePath);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
});

router.delete("/deleteImage/:filename", async (req, res) => {
  try {
    const dirPath = path.join(__dirname, "../uploads");
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(dirPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send(`File not found: ${filename}`);
    }
    await fs.promises.unlink(filePath);
    res.send(`${filename} ถูกลบแล้ว`);
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).send("Server Error: " + err.message);
  }
});

router.post("/uploadMedia", mediaUpload.single("media"), (req, res) => {
  try {
    res.send(req.file);
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
});

router.get("/listMedia", (req, res) => {
  try {
    res.send(listMediaFiles());
  } catch (err) {
    res.status(500).send("Server Error");
    console.log(err);
  }
});

router.delete("/deleteMedia/:filename", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(uploadDirPath, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send(`File not found: ${filename}`);
    }
    await fs.promises.unlink(filePath);
    res.send(`${filename} ถูกลบแล้ว`);
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).send("Server Error: " + err.message);
  }
});

module.exports = router;
