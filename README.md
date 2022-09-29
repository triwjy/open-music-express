# Open Music - Express

> Express-MongoDB version of [Open Music - Hapi-PostgreSQL](https://github.com/triwjy/open-music) with slightly different specification and features.

## Services:

> ### Authentication

```
  Service that handles access token and refresh token
```

> ### User

```
  Service that handles user registration and login.
```

> ### Album

```
Service that handles album resource.
Album can only be created, edited, and deleted by Admin role.
Album and Song can be associated each other.
Any role can view Album.
  GET /albums/{albumId} will show details of associated Song.
  GET /albums support query parameters: ?name, ?year, ?sortBy, ?limit, ?page (see swagger UI documentation for details)
```

> ### Playlist

```
  Service that handles playlist resource
```

> ### Song

```
  Service that handles song resource. Song can only be created, edited, and deleted by Admin role. Song and album can be associated each other. Any role can view Song.
```

## Features:

- ### Documentation: Swagger endpoint at /v1/docs

- ### Tests that can also serve as documentation for the API behavior. Run test: `npm test`

- ### Validation on query parameter and request body with Joi

- ### Centralized error handling mechanism

- ### Authentication and Authorization: with Passport

- ### Caching: Cache the number of **album likes** with Redis

- ### Asynchronous Messaging: Use RabbitMQ as message broker to playlist consumer to export playlist to user email.

- ### Image upload with multer
