# tRPC-learn

The tRPC-learn repository holds my initial experiments with tRPC protocol. My goal is to document my adventures as I learn the basics of the language.

tRPC stands for TypeScript Remote Procedure Call, and is the most simple and lightweight library for remotely calling backend functions on the client side. It aims to provide developers with the experience of TypeScript inference to make communication between the backend and frontend more productive.

It allows sharing of types between the client and server and just imports the types and not the actual server code, so none of the server code is exposed in the frontend.

## Configuration

1. Install `npm` on your operative system.
2. Install `docker` & `docker-compose` on your operative system.

## Installation

1. Install all dependencies using `npm`.

```sh
$ npm install
```

## Development

### Dev #0 - Docker services locally
First you need to activate a postgresql database, redis cache and other utilitaries. A user should run locally:
    - `adminer`: Database explorer running at `http://localhost:8080/`
    - `postgresql`: PostgreSQL Database running at `http://localhost:6500/` and `http://postgres:5432/` (inside docker private network).
    - `redis`: Redis Cache running at `http://localhost:6379/` and `http://redis:6379/` (inside docker private network).
To activate all services:
    1. Go to local infrastructure folder: `$ cd infrastructure/local`.
    2. Create a `.dev.env` file inside that folder with:
        ```
        DATABASE_PORT=6500
        POSTGRES_PASSWORD=fakePassword987
        POSTGRES_USER=postgres
        POSTGRES_DB=trpc_prisma
        POSTGRES_HOST=postgres
        POSTGRES_HOSTNAME=127.0.0.1
        ```
    3. Run `$ docker-compose up` or `$ docker-compose up -d` for silent mode.

### Dev #1 - Node backend / frontend

#### Dev #1.1 - Database seed
To migrate the current schema into our database, please run the commands bellow:

```sh
$ npm run db:migrate
$ npm run db:push
```

#### Dev #1.2 - Run backend and frontend
To activate both services (frontend / backend) you should run:

```sh
$ npm run start
```

## Bibliography
- Based on the youtube [video](https://www.youtube.com/watch?v=Lam0cYOEst8).
- tRPC [docs](https://trpc.io/docs/quickstart).
