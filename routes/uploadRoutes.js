import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/upload - upload single image
router.post("/", upload.single("image"), (req, res) => {
  const filePath = `/uploads/${req.file.filename}`;
  res.status(200).json({
    message: "✅ Image uploaded successfully",
    imageUrl: filePath,
  });
});

export default router;
