from pymongo import MongoClient
import argparse
import pymongo


def initialize_mongo(db):
	db.profiles.create_index([
	    ("user", pymongo.ASCENDING)
	    ], unique=True)
	db.profiles.create_index([
	    ("name", pymongo.ASCENDING)
	    ], unique=True)
	print "[+] Created index for profiles collection."

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Configures a MongoDB.")
    parser.add_argument("--host", type=str, help="Address of MongoDB", required=True)
    parser.add_argument("--port", type=int, default=27017, help="Port of MongoDB")
    args = parser.parse_args()
    mongo_url = "{0}:{1}".format(args.host, args.port)
    print "[ ] Attempting to connect to " + mongo_url
    client = MongoClient(host=args.host, port=args.port)
    print "[+] Connected to MongoDB at " + mongo_url
    initialize_mongo(client.rivestment)
