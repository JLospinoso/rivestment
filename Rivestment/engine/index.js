"use strict";

const md5 = require('js-md5');
const mongo = require('mongodb').MongoClient;
const mongoUrl = process.env.MONGO_URL;
const collectionName = process.env.COLLECTION_NAME;
const botName = process.env.BOT_NAME;
const preimageRange = process.env.PREIMAGE_RANGE;
const passwordRange = process.env.PASSWORD_RANGE;
const nChallenges = parseInt(process.env.N_CHALLENGES);
const passwordSize = parseInt(process.env.PASSWORD_SIZE);
const challengeCost = parseInt(process.env.CHALLENGE_COST);
const maxLevel = parseInt(process.env.MAX_LEVEL);
const maxScraps = parseInt(process.env.MAX_SCRAPS);
const maxSubmissions = parseInt(process.env.MAX_SUBMISSIONS);
const startingScore = parseInt(process.env.STARTING_SCORE);
const difficultyRange = parseInt(process.env.DIFFICULTY_RANGE);
const debugMode = parseInt(process.env.DEBUG_MODE);

const getSettings = function() {
    return {
        prefix: botName,
        challengeCost: challengeCost,
        preimageRange: preimageRange,
        startingScore: startingScore,
        nChallenges: nChallenges,
        maxScraps: maxScraps,
        maxSubmissions: maxSubmissions
    }
};

let ioSocket;
let mongoDb = null;

// Inclusive of min, exclusive of max: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

const queryMongo = function(callback) {
    if(!mongoDb) {
        mongo.connect(mongoUrl, function (err, db) {
            if (err == null) {
                mongoDb = db;
                let collection = mongoDb.collection(collectionName);
                callback(collection);
            } else {
                console.log("[-] Error connecting to MongoDB at " + mongoUrl);
            }
        });
    } else {
        let collection = mongoDb.collection(collectionName);
        callback(collection);
    }
};

function getAll(callback) {
    queryMongo(function(collection){
        collection.find(
            {},
            function (err, result) {
                if (err == null) {
                    result.toArray().then(function(resultAsList){
                        callback(resultAsList);
                    });
                } else {
                    console.log("[-] Error retrieving from mongo: " + err);
                }
            });
    });
}

function getUser(user, callback) {
    queryMongo(function(collection){
        collection.findOne(
            {
                user: user
            },
            function (err, result) {
                if (err == null) {
                    callback(result);
                } else {
                    console.log("[-] Error retrieving from mongo: " + err);
                }
            });
    });
}

const insertUser = function(profile, callback) {
    queryMongo(function(collection){
        collection.insertOne(
            profile,
            function (err, result) {
                if (err == null) {
                } else {
                    console.log("[-] Error updating mongo: " + err);
                }
                callback(result);
            });
    });
};

const updateUser = function(profile, callback) {
    queryMongo(function(collection){
        collection.updateOne(
            {
                user: profile.user
            },
            profile,
            { },
            function (err, result) {
                if (err == null) {
                    callback(result);
                } else {
                    console.log("[-] Error updating mongo: " + err);
                }
            });
    });
};

function rmUser(user, success) {
    queryMongo(function(collection){
        collection.removeOne(
            {
                user: user
            },
            function (err, result) {
                if (err == null) {
                    success(result);
                } else {
                    console.log("[-] Error updating mongo: " + err);
                }
            });
    });
}

const randomInts = function (minimum, maximum, n) {
    let list = [];
    for (let i = 0; i < n; i++) {
        list.push(getRandomInt(minimum, maximum));
    }
    return list;
};

const makeRandom = function (length, chars) {
    let text = "";
    for (let i = 0; i < length; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
};

const makeKeys = function (password, lengths) {
    let challenges = [];
    for (let i = 0; i < lengths.length; i++) {
        challenges.push(makeRandom(lengths[i], preimageRange) + password);
    }
    return challenges;
};

const makeHashes = function (keys) {
    let hashes = [];
    keys.forEach(function (key) {
        let hash = md5.create();
        hash.update(key);
        let hashedKey = hash.hex();
        hashes.push(hashedKey);
    });
    return hashes;
};

let messageSender = function (message, channel) {
    console.log("[-] No message sending function configured for engine.")
};

const updateClientScoreboards = function () {
    getAll(function(profiles){
        "use strict";
        ioSocket.emit('updateScoreboard', profiles);
    });
};

const newUserProfile = function(name, user) {
    return {
        score: startingScore,
        name: name,
        user: user,
        password: makeRandom(passwordSize, passwordRange),
        level: 1,
        challenges: {
            hash: [],
            key: [],
            difficulty: []
        }
    };
};

const handle = function (user, channel, cmd) {
    if (cmd[0] === "register" && cmd[1]) {
        insertUser(newUserProfile(cmd[1], user),
            function(result){
                getUser(user, function(userProfile){
                    messageSender("You are registered as " + userProfile.name, channel);
                    updateClientScoreboards();
                    ioSocket.emit('update', {
                        type: "Joined",
                        user: userProfile.name,
                        text: "Joined the game. Welcome!"
                    });
                });
            }
        );
    }
    if (cmd[0] === "challenge") {
        let challengesRequested = parseInt(cmd[1]);
        if(!challengesRequested) {
            challengesRequested = nChallenges;
        }
        const bill = challengeCost * challengesRequested;
        getUser(user, function (userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }
            const nScraps = userProfile.challenges.hash.length;
            const proposedScraps = nScraps + challengesRequested;
            if(proposedScraps > maxScraps) {
                messageSender("I can't give you " + challengesRequested + " challenges, " + userProfile.name + ". You would "
                    + " have " + proposedScraps + " scraps, and that's greater than the limit of " + challengesRequested + ".")
                return;
            }
            if (userProfile.score - bill < 0) {
                messageSender("You can't pay that bill, " + userProfile.name + ".  You need " + bill + " points to get " +
                    " that many challenges. Either quit or solve some scraps.", channel);
                return;
            }
            userProfile.score -= bill;
            let minimumDifficulty = userProfile.level;
            let maximumDifficultyExclusive = minimumDifficulty + difficultyRange;
            let difficulties = randomInts(minimumDifficulty, maximumDifficultyExclusive, challengesRequested);
            let keys = makeKeys(userProfile.password, difficulties);
            let hashes = makeHashes(keys);
            userProfile.challenges.difficulty = userProfile.challenges.difficulty.concat(difficulties);
            userProfile.challenges.key = userProfile.challenges.key.concat(keys);
            userProfile.challenges.hash = userProfile.challenges.hash.concat(hashes);
            let challengeMessage = userProfile.name + " challenges";
            for (let i = 0; i < hashes.length; i++) {
                challengeMessage += " " + hashes[i];
            }
            updateUser(userProfile, function () {
                messageSender(challengeMessage, channel);
                updateClientScoreboards();
            });
            ioSocket.emit('update', {
                type: "Challenge",
                user: userProfile.name,
                text: "Just bought some challenges. Good luck!"
            });
        });
    } else if (cmd[0] === "level") {
        const newLevel = parseInt(cmd[1]);
        if (!newLevel || newLevel < 1 || newLevel > maxLevel) {
            messageSender("You must provide a valid level.", channel);
            return;
        }
        getUser(user, function (userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }

            userProfile.level = newLevel;
            updateUser(userProfile, function () {
                messageSender("I've updated your level to " + userProfile.level + ", " + userProfile.name + ".", channel);
                updateClientScoreboards();
            });
            ioSocket.emit('update', {
                type: "Level",
                user: userProfile.name,
                text: "Updated to level " + newLevel + ".",
                level: newLevel
            });
        });
    } else if (cmd[0] === "password") {
        getUser(user, function (userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }
            messageSender(userProfile.name + " password " + userProfile.password, channel);
        });
    } else if (cmd[0] === "points") {
        getUser(user, function (userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }
            messageSender(userProfile.name + " points " + userProfile.score, channel);
        });
    } else if (cmd[0] === "try") {
        if (!cmd[1]) {
            messageSender("You must provide at least one preimage for me to check.", channel);
            return;
        }
        getUser(user, function(userProfile) {
            const nSubmissions = Math.min(maxSubmissions, cmd.length-1);
            const oldScore = userProfile.score;
            for (let keyIndex=0; keyIndex<nSubmissions; keyIndex++) {
                let keySubmission = cmd[keyIndex+1];
                let challengeIndex = userProfile.challenges.key.indexOf(keySubmission);
                if (challengeIndex === -1) {
                    messageSender("I don't know what challenge you're talking about, " + userProfile.name, channel);
                    return;
                }
                let pointsEarned = userProfile.challenges.difficulty[challengeIndex];
                userProfile.challenges.difficulty.splice(challengeIndex, 1);
                userProfile.challenges.key.splice(challengeIndex, 1);
                userProfile.challenges.hash.splice(challengeIndex, 1);
                userProfile.score += pointsEarned;
            }
            updateUser(userProfile, function() {
                updateClientScoreboards();
            });
            const pointsEarned = userProfile.score - oldScore;
            ioSocket.emit('update', {
                type: "Submission",
                user: userProfile.name,
                text: "Submitted " + nSubmissions + " passwords and earned " + pointsEarned + " points.",
                score: userProfile.score
            });
        });
    } else if (cmd[0] === "scraps") {
        getUser(user, function(userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }
            let scrapMessage = userProfile.name + " scraps";
            for (let i = 0; i < Math.min(userProfile.challenges.hash.length, 100); i++) {
                scrapMessage += " " + userProfile.challenges.hash[i];
            }
            messageSender(scrapMessage, channel);
            ioSocket.emit('update', {
                type: "Scraps",
                user: userProfile.name,
                text: "Called for scraps."
            });
        });
    } else if (cmd[0] === "quit") {
        getUser(user, function (userProfile) {
            if (!userProfile) {
                messageSender("You are not registered.", channel);
                return;
            }
            ioSocket.emit('update', {
                type: "Quit",
                user: userProfile.name,
                text: "Quit the game."
            });
        });
        rmUser(user, function(userProfile) {
            messageSender("You have been removed.", channel);
            updateClientScoreboards();
        });
    }
};

module.exports = function(io) {
    ioSocket=io;
    return {
    messageCallback: function(message) {
        if(!message.text){
            return;
        }
        let user_id = message.user;
        if(message.bot_id) {
            user_id = message.bot_id;
        }

        let tokens = message.text.split(" ");
        if (tokens && tokens[0] === botName) {
            tokens.shift();
            if (tokens) {
                handle(user_id, message.channel, tokens);
            } else {
                messageSender(message.user + ": Unknown command.", message.channel);
            }
        }
    },
    setMessageSender: function(newMessageSender) {
        messageSender = newMessageSender;
    },
    range: preimageRange,
    settings: getSettings,
    profiles: function(callback){
        getAll(function(res){
            if(!debugMode) {
                res.forEach( function(x){
                    delete res.challenges;
                });
            }
            callback(res);
        });
    }
}};
