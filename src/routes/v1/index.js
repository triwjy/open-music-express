const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const albumRoute = require('./album.route');
const songRoute = require('./song.route');
const docsRoute = require('./docs.route');
const playlistRoute = require('./playlist.route');
const exportRoute = require('./export.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/albums',
    route: albumRoute,
  },
  {
    path: '/songs',
    route: songRoute,
  },
  {
    path: '/playlists',
    route: playlistRoute,
  },
  {
    path: '/exports',
    route: exportRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
