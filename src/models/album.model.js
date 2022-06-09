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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
albumSchema.plugin(toJSON);
albumSchema.plugin(paginate);

/**
 * @typedef Album
 */
const Album = mongoose.model('Album', albumSchema);

module.exports = Album;
