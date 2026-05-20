import path from "path";
import express from "express";
import multer from "multer";
import fs from "fs";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    // Sanitize filename — remove special chars
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const safeName = `image-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept any image MIME type — covers jpg, png, webp, gif, jfif, avif etc
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

router.post("/", authenticate, authorizeAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (req.file) {
      return res.status(200).json({
        message: "Image uploaded successfully",
        image: `/uploads/${req.file.filename}`,
      });
    }
    return res.status(400).json({ message: "No image file provided" });
  });
});

export default router;
