Rivestment
==

Rivestment is a game of MD5 collisions. You interact with the score server
through Slack chat channels, and winning strategies generally involve building
Slack bots to do the required work and interact with the score server.

Rivestment was created as a teaching tool for getting students engaged in learning
how to write high-level and performant software in the classroom.

Setting up Rivestment
==

Rivestment is comprised of two services: (a) a *node.js* service and (b) a MongoDB
service. Both of these services are containerized and available on
[quay.io](https://quay.io/repository/jlospinoso/rivestment).

[![rivestment container](https://quay.io/repository/jlospinoso/rivestment/status "Docker Repository on Quay")](https://quay.io/repository/jlospinoso/rivestment)

[![rivest-mongo](https://quay.io/repository/jlospinoso/rivest-mongo/status "Docker Repository on Quay")](https://quay.io/repository/jlospinoso/rivest-mongo)

You actually don't need anything in this repository to get started. Simply create
a `docker-compose.yml` that looks like this:

```yml
version: '2'

services:
  mongo:
    image: quay.io/jalospinoso/rivest-mongo
    expose:
    - "27017"
    ports:
    - "27017:27017"
    restart: always
  rivestment:
    image: quay.io/jalospinoso/rivestment
    ports:
    - "80:80"
    restart: always
    links:
    - mongo:mongo
    entrypoint: npm start
    environment:
    - MONGO_URL=mongodb://192.168.99.100:27017/rivestment
    - COLLECTION_NAME=profiles
    - BOT_NAME=scorebot
    - PREIMAGE_RANGE=hark
    - PASSWORD_RANGE=abcdefghijklmnopqrstuvwxyz0123456789
    - N_CHALLENGES=10
    - PASSWORD_SIZE=6
    - CHALLENGE_COST=50
    - INCORRECT_PENALTY=5
    - MAX_LEVEL=25
    - MAX_SCRAPS=250
    - SLACK_TOKEN=!!PUT-YOUR-TOKEN-HERE!!
    - STARTING_SCORE=100
```

_This example is also available in the repository as `docker-compose.yml-remote`.
You will need to rename it to `docker-compose.yml` if you intend to use it as
a template._

All you need to do is [generate a Slack API Token here](https://api.slack.com/tokens)
and insert it onto this line of the `docker-compose.yml`:

```yml
    - SLACK_TOKEN=!!PUT-YOUR-TOKEN-HERE!!
```

In the same directory as your `docker-compose.yml`, issue the following command:

```sh
docker-compose up
```

and that's it! Navigate using your web browser to the IP address of your container
host and get started in the "Instructions" tab.

Building Rivestment
==

Of course, you can pull down this repository and customize Rivestment to your liking.
In this case, you'll want to use the `docker-compose.yml` that ships with the repository:

```yml
version: '2'

services:
  mongo:
    build: ./Mongo
    expose:
    - "27017"
    ports:
    - "27017:27017"
    restart: always
  rivestment:
    build: ./Rivestment
    ports:
    - "80:80"
    restart: always
    links:
    - mongo:mongo
    entrypoint: npm start
    environment:
    - MONGO_URL=mongodb://192.168.99.100:27017/rivestment
    - COLLECTION_NAME=profiles
    - BOT_NAME=scorebot
    - PREIMAGE_RANGE=hark
    - PASSWORD_RANGE=abcdefghijklmnopqrstuvwxyz0123456789
    - N_CHALLENGES=10
    - PASSWORD_SIZE=6
    - CHALLENGE_COST=50
    - INCORRECT_PENALTY=5
    - MAX_LEVEL=25
    - MAX_SCRAPS=250
    - SLACK_TOKEN=!!PUT-YOUR-TOKEN-HERE!!
    - STARTING_SCORE=100
```

Again, you'll need to replace the `SLACK_TOKEN` environment variable with a valid one.
Rather than pulling the images from the quay.io repository, in this approach you'll build
your own custom images.

Of course, the `docker-compose` command is the same:

```sh
docker-compose up
```

Resources
==

See [Matterbot](https://github.com/JLospinoso/matterbot) for a C++ bot framework
that you can use to implement a competitor bot for Rivestment.
