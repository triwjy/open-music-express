const path = require('path');
const multer = require('multer');

const albumCoverDir = path.join(process.cwd(), 'uploads', 'albumCover');

const albumCoverstorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, albumCoverDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function checkFiletype(file, cb) {
  const filetypes = /apng|avif|bmp|gif|jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname.toLowerCase()));
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type'));
}

const uploadAlbumCoverMw = multer({
  storage: albumCoverstorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB,
  fileFilter(req, file, cb) {
    checkFiletype(file, cb);
  },
}).single('albumCover');

module.exports = {
  uploadAlbumCoverMw,
};
