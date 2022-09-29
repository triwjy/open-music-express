# Open Music - Express

> Express-MongoDB version of [Open Music - Hapi-PostgreSQL](https://github.com/triwjy/open-music) with slightly different specification and features.

## Services:

> ### Authentication

> Service that handles access token and refresh token.  
> Routes that require authentication will require JWT access token in the **Authorization** request header with **Bearer** schema.  
> Access token (and refresh token) will be generated upon successful call to `POST /v1/auth/register` or `POST /v1/auth/login`.  
> Access token will valid for 30 minutes while refresh token will valid for 30 days.  
> To generate new acess token, refresh token endpoint `POST /v1/auth/refresh-tokens` needs to be called along with sending the refresh token in the request body. This call will return new access token and refresh token.  
> Rate limiter of 20 calls in 15 minutes for each IP is applied on `/v1/auth/` routes in **production environment** to prevent brute-force attack.

> ### Authorization

> ### User

```
  Service that handles user registration and login.
```

> ### Album

Service that handles album resource.  
Album can only be created, edited, and deleted by Admin role.  
Album and Song can be associated each other.  
Any role can view Album.

GET /albums/{albumId} will show details of associated Song.  
GET /albums support query parameters: ?name, ?year, ?sortBy, ?limit, ?page (see swagger UI documentation for details).s

> ### Playlist

```
  Service that handles playlist resource
```

> ### Song

```
Service that handles song resource.
Song can only be created, edited, and deleted by Admin role.
Song and album can be  associated each other.
Any role can view Song.

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
