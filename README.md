![Rivestment](https://raw.githubusercontent.com/JLospinoso/rivestment/master/ai/title.png)

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

[![rivestment container](https://quay.io/repository/jlospinoso/rivestment/status "rivestment Docker Repository on Quay")](https://quay.io/repository/jlospinoso/rivestment)

[![rivest-mongo container](https://quay.io/repository/jlospinoso/rivest-mongo/status "rivest-mongo Docker Repository on Quay")](https://quay.io/repository/jlospinoso/rivest-mongo)

You actually don't need anything in this repository to get started. Simply create
a `docker-compose.yml` that looks like `docker-compose.yml-remote`.
You will need to rename it to `docker-compose.yml` if you intend to use it as
a template.

All you need to do is [generate a Slack API Token here](https://api.slack.com/custom-integrations/legacy-tokens)
and insert it onto this line of your `docker-compose.yml`:

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
In this case, you'll want to use the `docker-compose.yml` that ships with the repository.
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
