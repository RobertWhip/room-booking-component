
# room-booking-component

room booking system – Nest.js slots booking API.

## Start the app locally

### 1. Install Docker images using docker-compose:

Use docker-compose (it's recommended to use [v2.25.0](https://github.com/docker/compose/releases/tag/v2.25.0)) to install and start all the necessary docker images:
```bash
# start environemnt
$ docker-compose up -d

# select correct Node.js version
$ nvm use

# install npm packages
$ npm install

# start the app
$ npm start
```

Now you have a fully working infrastucture with loaded seed data to the database.

### 2. Interact with the API:
**room-booking-componse** is running by default at ```http://localhost:3000```.
See the [Postman documention](gooogle.com) to easily interact with the API.

Other services:

**rabbitmq web interface** is running by default at ```http://localhost:15672/```. The defeault username is ```guest``` and the password is ```guest``` too. Here you can find the messages that the **room-booking-component** publishes.

**rabbitmq** runs at ```http://localhost:5672```.

**postgresql** runs at ```http://localhost:5432```.

## App details

img
### Components of the app:
**AppModule**: this module serves as the primary entry point for the Nest.js application, orchestrating its initialization and configuration:
1. **AmqpModule**: within this module resides the logic responsible for publishing messages to AMQP (Advanced Message Queuing Protocol) channels. It encapsulates functionalities related to communication via AMQP channels.
2. **ApiModule**: aggregates sub-modules modules:
	2.1. **UserModule**: this module provides a straightforward API for creating and retrieving user entities within the application (without *authorization* and *authentication*).
	2.2. **RoomModule**: here lies an API for managing rooms along with their associated time slots. Users can create rooms and allocate time slots as per their requirements.
	2.3. **BookingModule**: this module offers an API for reserving and unreserving time slots within rooms.
3. **Configs**: configuration files essential for configuring various aspects of the application, including connections to AMQP, database settings, and caching configurations.

### Few notes before reviewing:
1. I aimed to break down (de-couple) the app into smaller independent parts to prepare for potential growth and make it easier to manage as separate microservices, thus make easier to deal with high traffic.
2. Additionally, UUIDs were employed to facilitate database scalability. Using UUIDs as primary keys in database tables can aid in horizontal scalability compared to traditional auto-incrementing integer keys.
3. While I recognize the need for user authentication, I didn't include it in my solution. My focus was more on the design itself, and without specific details on where authentication fits in the ecosystem, it's hard to integrate.
4. Code coverage isn't comprehensive, mainly because this is a test task. I prioritized testing for projects that will actually be deployed (but a few unit-tests were written).
5. I've set up the app to fetch configurations from environment variables, making it adaptable to any environment during deployment.
6. I've left some TODOs undone in the code, mainly because this is a test task. But for a real-world app, I'd address them to ensure highest quality. I've also noted some areas where coding practices could be improved.
7. I would definitely pay attention to ./src/amqp module as it could use some refactoring for better clarity and understanding.
8. You might find some parts of the project lacking TypeScript types since this isn't intended for production deployment.
9. I didn't fully implement or use some modules like ./shared.
10. I haven't included database pooling or benchmarks in this version.
11. Integration and end-to-end tests weren't part of the technical task, so I skipped them for this test app.
12. The room timeslots logic were keeped to the simplest solution, so there can be more focus on the transaction and the data consistency itself.
13. In the project, Swagger was initially integrated for API documentation purposes. However, after further consideration, a decision was made to switch to Postman documentation. Despite this change, the integration of Swagger remains intact, providing flexibility for potential future use or as an alternative documentation solution if needed.
14. The app requires monitoring. This repository doesn't include it


## Development
### Versions:
Node.js version: 20.11.1
PostgreSQL version: 16.2
RabbitMQ version: 3.x.x
Docker-compose version: 2.25.0

### Running the app
Start Nest.js server:
```bash
# switches Node.js version to the one that is specified in .nvmrc
$ nvm use

# install npm packages
$ npm install

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test
Run unit-tests and check code coverage:

```bash
# unit tests
$ npm run test

# e2e tests (currently not developed)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Lint
Run unit-tests and check code coverage:

```bash
# unit tests
$ npm run lint
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
