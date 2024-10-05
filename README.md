# user-management-api

User Management API implementation with Fastify and Prisma.

## General Architecture

The API is built using Fastify, Prisma, and TypeScript. I have structured the project into packages to make it easier to manage and maintain. This is a monorepo project, and the packages are defined in the `packages` directory and organized into three main categories: server, database, and real-time notifications.

### Packages

#### server

The server package contains the API server implementation using Fastify. It is responsible for handling incoming requests, routing them to the appropriate controllers, and returning the appropriate responses. The controllers are responsible for handling the business logic and interacting with the database.

#### db

The database package contains the database definition using Prisma. Every time a change is made to the database schema, it's required to run the migrations to update the database. The migrations are defined in the `prisma/migrations`. Having our database definition in a separate package makes it easier to manage and maintain.

#### real-time-notifications

The real-time notifications package contains the implementation of real-time notifications using WebSockets. It is responsible for opening new WebSocket connections, broadcasting notifications to all connected clients and managing the WebSocket connection lifecycle using the `ws` package for WebSocket communication. The goal of this package is to provide a centralized place for real-time notifications, allowing different parts of the application to easily send notifications to all connected clients. In a large application, it may be necessary to have multiple WebSocket connections for different purposes, such as sending notifications to specific users or groups of users.

## Development process

Here, I'm going to detail step by step how I developed this project, and explain some of my decisions and my thought process.

### Task 1: Advanced Monorepo Setup

While this task was optional, I decided to go with it. Although this API was supposed to be something simple, the idea was to organize the project in a way that could be easily maintained and scaled. `Lerna` seemed to be a popular choice to create a monorepo, so I used it to set up the project. I also used `tsc` to compile the TypeScript code into JavaScript, and be able to create the `dist` folder with the compiled code. For this task, I set up a custom linter and formatter using `eslint` and `prettier`, and configured it to work with TypeScript.

### Task 2: Advanced Server Setup

I was reading a bit through Fastify's documentation and quickly set up a basic server using TypeScript. Now, I had to make a choice on how to organize the routes and controllers. Many projects use "routes" and "controllers" folders. However, I like better the _screaming architecture_ approach, where every different model / area has its own folder, and inside it we can place controllers, services, etc. From my perspective, this approach makes the project easier to maintain and understand, especially when it gets larger.

### Task 3: Advanced Database Integration with Prisma and PostgreSQL

I integrated Prisma with PostgreSQL. I chose AWS RDS as my database provider, and I created a new database instance for this project. I mapped the model "User" to the table "users" in the database, and I configured the Prisma schema to reflect the database schema. I also created a migration file for the initial database setup, and I ran the migrations to create the "users" table in the database.

After that, I created basic CRUD operations for the "users" table, and I tested them with Postman. I created a file for routes, which will link fastify routes to controllers, which have their own file. Then, I also created a file for services, as I felt more comfortable separating the queries to the DB from the controllers. That seems more scalable to me, as in the future, if we need to change the way we connect with the database, we can modify only the service file, and not the controllers.

As for the schema, I realized that many people use "zod" for schema validation. However, I wanted to use a different approach. Digging into Fastify's documentation, I found that Fastify has a built-in schema validation system. Instead of adding schemas within a common `addSchema` function, I created a JSON schema file for each route. A new file specifically for schemas was created, and I was happy with how simple and clear it looks.

Automatic validation is also great, but a in a long run, I personally like having my own validations. That's why I created a file for validations, and that helped to have an extra layer of validation, and return our custom errors, instead of just returning the default Fastify errors.

One validation and error handling was covered, I also added basic pagination to the API, with skip and limit parameters. I added a config file for options like this, and placed the pagination options in there.

After all this, on the Prisma side I added a new model "Post" and a relationship between the "User" and "Post" models. I used prisma to migrated the database, and I tested it with Postman. As it wasn't a requirement, I decided to skip the addition of CRUD operations for posts. It wouldn't really add an extra layer of complexity, it would just take time to implement it.

### Task 4: Authentication and Authorization

I added the logic to create and validate JWT tokens. A new endpoint for login was created, and I tested it with Postman. The endpoint returns an access token, which is used to authenticate users. Instead of using a simple built-in pre-validation hook, I created my own middleware to check if the user is authenticated, and the user role. Some operations (create, update, and delete user), are only allowed for admins. If we want to add more roles in the future, we can simply change the middleware (`controlRoleBasedAccess`) to check for the role.

I encrypted the passwords using crypto, and added "salt" to the user model.

A directory for the login endpoint was added to the server package. At some point, it was convenient to have a types file for users and login, so I added files for that.

### Task 5: Advanced API features

I created a new endpoint for uploading user avatars. User avatars are stored in the `uploads` directory, and the endpoint returns the name of the uploaded file. The field "avatar" was added to the user model, and I added a validation for it. Only an admin user can upload a user avatar. In some systems, it could be convenient that every user uploads his own avatar. The permissions for this action would be different in a random online forum and in a company's internal application. I decided to forbid non-admin users to upload his own avatar. A different approach would be to allow non-admin users to upload avatars, but only for themselves.

As for the schema of this new endpoint, I saw an awkward warning message from TypeScript. The body usually requires the type "object" in the schema, but if I add it here, the file upload will fail. As I wasn't sure how to fix this, and it was just a warning that didn't seem to be very relevant, and I decided to ignore it. I would like to take another look at this later though.

For real-time notifications, I created a new endpoint. However, as I was setting up a monorepo, I decided to make good use of this, and set up the real-time-notifications package with `ws`. The advantage of this approach is that we can always change the way we handle websocket connections. If we want to use a different library, we can just change it in that package. Additionally, other packages could be using this websocket implementation. I think it was a great idea to make it modular like this.

I decided to do this in a way that users can connect to the websocket and see messages for relevant operations in the system (create, update, delete user, upload avatar). However, the users should not be able to send any sort of notification on their own. This socket is strictly for information purposes (read-only). The users can only connect to the websocket if they are authenticated.

At some point here I thought that the API also needed a rate limit, so I added it with a fastify plugin. I added rate limiting options as environment variables.

Why did I add these options as environment variables, when I could have added them to the config file, as I did for pagination?

For me, the decision was very clear. It could happen that we deploy our API in a customer's infrastructure. We might want to adjust our rate limit depending on the customer's needs. However, in very rare ocassions we are going to define pagination differently for different customers. That was the main reason. Rate limiting can be tailored for each customer, and the pagination is something generic for our API.

### Task 6: Testing and Documentation

I had used Swagger in the past, and checking Fastify's documentation, I saw that it was very simple to add Swagger to the API with a Fastify plugin. It was pretty straightforward. I just to fix the schemas a bit to have the right tags. At this point, the server file was starting to get a bit larger than expected, so I created a folder for the plugins, which will make the codebase more clean and easier to maintain in the future.

Then I had to add some tests using Jest. This is one of the simplest tasks of the project, but it would also take time to add tests for everything. I added tests for routes and controllers.

Honestly, at this point I considered that I had spent a reasonable amount of time on this project, and the remaining tests wouldn't prove any special skill from me. I took the decisions to skip the tests for services, but below I will provide more details about how more tests can be added and improved.

### Task 7: Monorepo and Separate Packages

As I mentioned before, I decided to go with a monorepo setup. This required to make sure that the packages were working together properly, before and after building. I chose heroku as my deployment platform, and I added a custom domain with SSL certificates.

## Deployment details

The API can be accessed at https://omarferreiroapi.online

In order to get the access token, it's required to send the following body to `https://omarferreiroapi.online/api/v1/login`:

```
{
    "email": "<valid email>",
    "password": "<valid password>",
}
```

_Note: The credentials have been provided separatedly_

Then the access token will be sent back. This bearer token must be added to the authorization for the other requests. If using Postman, Auth type must be set to "Bearer token", and the token can be directly copied there.

More details about how to access these endpoints can be found in the swagger documentation at https://omarferreiroapi.online/documentation/ui

## Local deployment instructions

Run `npm install` to install the dependencies.

You can run the scripts `npm run lint` and `npm run test` to make sure that everything is working properly.

To run the server locally, run `npm run dev`.

To build the server, run `npm run build`. Finally, the command `npm run start` will start the server with the compiled code.

Locally, it is possible to see the uploaded files in the server package, under the `/src/uploads` directory.

These are the environment variables that must be set:

- PORT: The port to run the server on
- HOST: The host to run the server on
- ENVIRONMENT: The environment to run the server in (development, production, or test)
- JWT_SECRET: The secret key for JWT tokens
- RATE_LIMIT: The maximum number of requests per time window
- RATE_LIMIT_TIME_WINDOW: The time window for rate limiting
- DATABASE_URL: The URL for the database

For example:

```
PORT=3010
HOST=0.0.0.0
ENVIRONMENT=development
JWT_SECRET=237n8hc23f78784rtvhn8v274
RATE_LIMIT=50
RATE_LIMIT_TIME_WINDOW=1 minute
DATABASE_URL="postgresql://<username>:<password>@<host>:<post>/<db_name>"
```

## Next steps and potential improvements

### Testing

#### Missing tests

We need to add the missing tests for the server package.

Additionally, we need to add tests for the websocket package.

We would need tests for authentication and authorization.

With more time, I'd like to test the rate limiting and pagination options. A tool that I used in the past and was very helpful was `Artillery`. It was a great tool to simulate a load of requests and test the performance of the API. There is a way to use within Node.js tests.

#### Improvements of our tests

I think we should come up with standard error codes and messages for the API. These could be placed in a config file, and used in the tests, validators and schemas. This would make our codebase easier to maintain and understand.

We should also create mocked data in a separate file, and use it in the tests. Making it more modular would be better in this case.

#### E2E tests

I believe E2E tests are the best way to test a system. However, it makes more sense to test a FrontEnd together with the API. That ensures that everything works properly together. Using `Cypress` would be my choice for this.

### Load balancing

In a large system, where various server are set up together, it's important to have a way to balance the load between them. In the past I worked with NginX and HAProxy to set up rate limiting and load balancing.

### Real-time notifications

#### Websocket libraries

In the past, I have run some benchmarking to identify which of the many options out there was the most efficient. I found that `[uWebSockets](https://github.com/uNetworking/uWebSockets)` was the fastest option. Of course, there were other very good options, and it really depends on your preferences and needs after all. This was like 2 years ago, so I would really like to repeat that now, to see if something has changed.

For this particular project, I'd recommend to continue developing the websockets package, and see if with the time it makes sense to move to a different library.

#### Message queues

For a larger system, I would implement a message queue. In the past, I have used Kafka to push notifications, based on a listener in the postgres database. We had a service that was listening to the database, and when a new notification was created, it would first check whether the PubSub service was subscribed to that particular element, and if so, it would push it to a Kafka topic.

### Uploads

Using a cloud service when applicable would be a good idea.

### Logging options

I added a very simple logging system across the project. Personally, I like creating my own loggers, instead of just relying on a library. The reason is that it gives me more freedom and control over the logging, and I can customize it to my needs. For this project, it wasn't needed to do anything fancy, so I kept it simple, but I would like to create a custom package exclusively for this.

### Add posts CRUD endpoints

Of course, I couldn't forget!

### CI/CD pipelines

Personally, I like using Jenkins for CI/CD pipelines. We could add some github actions, and at least make sure that the tests are passing before we deploy the code. This will make more sense in the future, when more tests are added.

## Conclusion

This was a very interesting project to work on, and I appreciate the time you took to read all my verbose notes.