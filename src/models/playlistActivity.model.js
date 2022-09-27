const mongoose = require('mongoose');
const { paginate, toJSONWithCreatedAt } = require('./plugins');

const playlistActivitySchema = mongoose.Schema(
  {
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Playlist',
    },
    collaborator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Song',
    },
    action: {
      type: String,
      enum: ['add', 'delete'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
playlistActivitySchema.plugin(toJSONWithCreatedAt);
playlistActivitySchema.plugin(paginate);

// always populate with name and titles
playlistActivitySchema.pre('find', function () {
  this.populate('playlist', 'name').populate('collaborator', 'name').populate('song', 'title');
});

/**
 * @typedef PlaylistActivity
 */
const PlaylistActivity = mongoose.model('PlaylistActivity', playlistActivitySchema);

module.exports = PlaylistActivity;
