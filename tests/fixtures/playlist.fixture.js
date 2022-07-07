const mongoose = require('mongoose');
const faker = require('faker');
const { Playlist } = require('../../src/models');
const { userOne, userTwo } = require('./user.fixture');
const { songOne } = require('./song.fixture');

const playlistOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userOne._id,
  collaborators: [userOne._id, userTwo._id],
  songs: [songOne._id],
  activities: [
    {
      collaboratorId: userOne._id,
      songId: songOne._id,
      action: 'add',
    },
  ],
};

const playlistTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userTwo._id,
  collaborators: [userTwo._id],
  songs: [],
  activities: [],
};

const inserPlaylists = async (playlists) => {
  await Playlist.insertMany(playlists);
};

module.exports = {
  playlistOne,
  playlistTwo,
  inserPlaylists,
};
