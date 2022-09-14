const path = require('path');
const httpStatus = require('http-status');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const albumCoverDir = path.join(__dirname, '..', 'public', 'albumCover');

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
  const filetypes = /bmp|gif|jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname.toLowerCase()));
  const mimetype = filetypes.test(file.mimetype);

  // throw new ApiError(httpStatus.BAD_REQUEST);
  if (!mimetype || !extname) {
    const err = new Error('Invalid file type');
    err.code = httpStatus.BAD_REQUEST;
    return cb(err, false);
  }

  return cb(null, true);
}

const uploadAlbumCoverMw = (req, res, next) => {
  const upload = multer({
    storage: albumCoverstorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB,
    fileFilter(_, file, cb) {
      checkFiletype(file, cb);
    },
  }).single('albumCover');

  upload(req, res, function (err) {
    if (err) {
      return next(new ApiError(err.code, err.message));
    }
    next();
  });
};

module.exports = {
  uploadAlbumCoverMw,
};
