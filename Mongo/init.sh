/usr/bin/mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db/
python /opt/mongo/InitializeMongo.py --host 127.0.0.1
mongod --shutdown
