const mongoose = require('mongoose');
const faker = require('faker');
const { Playlist } = require('../../src/models');
const { userOne, userTwo } = require('./user.fixture');

const playlistOne = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userOne._id,
  collaborators: [userOne._id],
  songs: [],
  activities: [],
};

const playlistTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userOne._id,
  collaborators: [userOne._id],
  songs: [],
  activities: [],
};

const playlistThree = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userTwo._id,
  collaborators: [userTwo._id],
  songs: [],
  activities: [],
};

const playlistFour = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  owner: userOne._id,
  collaborators: [userOne._id],
  songs: [],
  activities: [],
};

const insertPlaylists = async (playlists) => {
  await Playlist.insertMany(playlists);
};

module.exports = {
  playlistOne,
  playlistTwo,
  playlistThree,
  playlistFour,
  insertPlaylists,
};
