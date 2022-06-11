const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const songSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    performer: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
    },
    albumId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
songSchema.plugin(toJSON);
songSchema.plugin(paginate);

/**
 * @typedef Song
 */
const Song = mongoose.model('Song', songSchema);

module.exports = Song;
