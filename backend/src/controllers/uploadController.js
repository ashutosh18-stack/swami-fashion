const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'swami-' + uniqueSuffix + ext);
  }
});

// File filter: strict validation of allowed image extensions & mime types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG luxury image formats are permitted.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 MB max per image
  }
});

/**
 * Handle single or multiple image uploads
 */
function handleUpload(req, res) {
  if (!req.files && !req.file) {
    return res.status(400).json({ success: false, error: 'No image files provided.' });
  }

  const files = req.files || [req.file];
  const uploadedUrls = files.map(f => `/uploads/${f.filename}`);

  return res.json({
    success: true,
    message: 'Images uploaded securely.',
    urls: uploadedUrls,
    url: uploadedUrls[0]
  });
}

module.exports = {
  upload,
  handleUpload
};
