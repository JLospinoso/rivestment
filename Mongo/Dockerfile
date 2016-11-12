FROM ubuntu:16.04
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org python python-pip
RUN pip install bson pymongo
RUN mkdir -p /data/db
COPY InitializeMongo.py /opt/mongo/
COPY init.sh /opt/mongo/
RUN chmod 755 /opt/mongo/*
RUN /usr/bin/mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db/ && python /opt/mongo/InitializeMongo.py --host 127.0.0.1 && mongod --shutdown
ENTRYPOINT /usr/bin/mongod --dbpath /data/db/
