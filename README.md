# Open Music - Express

Rewritten from [Open Music - Hapi-PostgreSQL](https://github.com/triwjy/openMusic) with slightly different specification and features. This REST API project is built using Node.js, Express, Mongoose, redis (for cache), amqplib (for asynchronous communication using AMQP between producer and consumer).

## Architecture:

![Alt text](doc/images/architecture.png?raw=true 'Architecture')

## Quick Start

```bash
git clone https://github.com/triwjy/open-music-express.git
```

Since the main app has dependency on other components (Redis, mongodb, rabbitmq, and export service consumer), the simplest way is to use Docker.

Running in development environment:

```bash
npm run docker:dev
```

Running in production environment:

```bash
npm run docker:prod
```

Test:

```bash
npm run docker:test
```

RabbitMQ management: http://localhost:15672

username & password: guest

## API Endpoints:

---

Detailed API specifications (using **swagger**) can be viewed by running the app in development environment and opening `http://localhost:5000/v1/docs` from your browser.

### Album routes

`POST /v1/albums` - create new album\
`GET /v1/albums` - get all albums (use pagination)\
`GET /v1/albums/:albumId` - get album detailed information\
`PATCH /v1/albums/:albumId` - modify album information\
`DELETE /v1/albums/:albumId` - delete an album\
`POST /v1/albums/likes/:albumId` - toggle like/unlike an album\
`GET /v1/albums/likes/:albumId` - get number of likes of an album\
`POST /v1/albums/albumCover/:albumId` - upload album cover image

Album routes handle all requests that's related to album resource. Only admin can modify the album resource.

All users can view the album and toggle album **likes**. Number of **album likes** is cached (server-side cache) by using Redis for 30 minute and will return custom header property `X-Data-Source` with value `cache`. Cache will be removed whenever the number of particular album likes is changed.

### Authentication routes

---

`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/logout` - logout\
`POST /v1/auth/refresh-tokens` - generate new access and refresh tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email\

Service that handles access token and refresh token. Routes that require authentication will require JWT access token in the **Authorization** request header with **Bearer** schema.

Access token (and refresh token) will be generated upon successful call to **register** or **login** endpoint. **Access token** will valid for 30 minutes while **refresh token** will valid for 30 days.

To generate new acess token, **refresh token endpoint** needs to be called along with sending the refresh token in the request body. This call will return new access token and refresh token.

Rate limiter of 20 calls in 15 minutes for each IP is applied on **authentication routes** in **production environment** (`npm start` or usind docker: `npm run docker:prod`) to prevent brute-force attack.

### Export routes

---

`POST /v1/exports/playlists/:playlistId` - export playlist by email.

Service that handles the export of resources (currently only playlist). This service uses message broker (RabbitMQ) with AMQP as asynchronous communication method. Another client (message consumer) will receive the message and do the actual export job.

### Playlist routes

---

`POST /v1/playlists` - create new playlist\
`GET /v1/playlists` - get all playlists that are associated to user\
`DELETE /v1/playlists/:playlistId` - delete a playlist\
`POST /v1/playlists/:playlistId/songs` - add new song to a playlist\
`GET /v1/playlists/:playlistId/songs` - show all songs of a playlist\
`DELETE /v1/playlists/:playlistId/songs` - remove a song from a playlist\
`POST /v1/playlists/:playlistId/collaborations` - add a collaborator to a playlist\
`DELETE /v1/playlists/:playlistId/collaborations` - remove a collaborator from a playlist\
`GET /v1/playlists/:playlistId/activities` - show activity log of a playlist\

Service that handles playlist resource. Playlist can be created and deleted by authenticated user (creator). Playlist creator can add other user as collaborator to edit playlist or remove collaborator. Only associated user (creator and collaborator) can view and edit playlist (add or remove song). Editing history on playlist will be recorded in playlist activities. Only playlist creator can view activities on playlist.

### Song routes

---

`POST /v1/songs` - add new song\
`GET /v1/songs` - get all songs with query parameters\
`GET /v1/songs/:songId` - get a detailed song information\
`PATCH /v1/songs/:songId` - edit a song\
`DELETE /v1/songs/:songId` - delete a song\

Service that handles song resource. Song can be viewed by anyone. Song can only be created, edited, and deleted by Admin role. Song and album can be associated each other.

## Features:

---

- ### Documentation: Swagger endpoint at /v1/docs, only available in development environment: `npm run dev` or using docker: `npm run docker:dev`

- ### Tests that can also serve as documentation for the API behavior. Run test: `npm test` or using docker: `npm run docker:test`

- ### Validation on query parameter and request body with Joi to sanitize request, multer file type validation (also reject untrusted .svg) to prevent XSS and code injection

- ### Centralized error handling mechanism on controller, uniform format on API error message.

- ### User registration and authentication with JWT token.

- ### Caching: Server-side cache the number of **album likes** with Redis on GET request, cache is cleared when modified.

- ### Asynchronous Messaging: Use RabbitMQ as message broker to playlist consumer to export playlist to user email.

- ### Album cover image upload with multer
