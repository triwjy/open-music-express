const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Song = require('./song.model');

const albumSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Song,
      },
    ],
    coverUrl: String,
    totalLikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Add likes count to album
 * @returns {Promise<Album>}
 */
albumSchema.methods.addLikes = async function () {
  const album = this;
  album.totalLikes += 1;
  await album.save();
  return album;
};

/**
 * Reduce likes count to album
 * @returns {Promise<Album>}
 */
albumSchema.methods.reduceLikes = async function () {
  const album = this;
  album.totalLikes -= 1;
  await album.save();
  return album;
};

// add plugin that converts mongoose to json
albumSchema.plugin(toJSON);
albumSchema.plugin(paginate);

/**
 * @typedef Album
 */
const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
