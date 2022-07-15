const mongoose = require('mongoose');
const PlaylistActivity = require('./playlistActivity.model');
const { toJSON, paginate } = require('./plugins');
const Song = require('./song.model');
const User = require('./user.model');

const playlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
      },
    ],
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Song,
      },
    ],
    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: PlaylistActivity,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
playlistSchema.plugin(toJSON);
playlistSchema.plugin(paginate);

/**
 * @typedef Playlist
 */
const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
