const mongoose = require('mongoose');
const faker = require('faker');
const { albumTwo, albumOne } = require('./album.fixture');
const { Song } = require('../../src/models');

const songOne = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  year: 2001,
  genre: faker.music.genre(),
  performer: faker.name.findName(),
  duration: Math.floor(Math.random() * 20) + 180,
  albumId: albumOne._id.toHexString(),
};

const songTwo = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  year: 2001,
  genre: songOne.genre,
  performer: songOne.performer,
  duration: Math.floor(Math.random() * 20) + 180,
  albumId: albumOne._id.toHexString(),
};

const songThree = {
  _id: mongoose.Types.ObjectId(),
  title: faker.name.findName(),
  year: 2002,
  genre: faker.music.genre(),
  performer: faker.name.findName(),
  duration: Math.floor(Math.random() * 20) + 180,
  albumId: albumTwo._id.toHexString,
};

const insertSongs = async (songs) => {
  await Song.insertMany(songs);
};

module.exports = {
  songOne,
  songTwo,
  songThree,
  insertSongs,
};
