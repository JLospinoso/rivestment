"use strict";

let slackToken = process.env.SLACK_TOKEN;
let callback = function() { };
let messageId = 0;
let wsSender = function (message) {
    console.log("[-] WebSocket is not connected; can't send " + message)
};
const connectWithSlack = function() {
    let slackSocket;
    const https = require("https");
    const WebSocket = require('ws');

    https.request({
        host: "slack.com",
        path: "/api/rtm.start?token=" + slackToken
    }, function(response){
        let str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log("[ ] Received response from Slack.");
            const responseObject = JSON.parse(str);
            if(responseObject.ok) {
                const wssUrl = responseObject.url;
                console.log("[ ] Secure WebSocket for Slack RTM: " + wssUrl);
                slackSocket = new WebSocket(wssUrl);
                wsSender = function(message) {
                    if(slackSocket.readyState === WebSocket.OPEN) {
                        slackSocket.send(message)
                    } else {
                        console.log("[-] Dropping message " + message + ", since WebSocket not open.");
                    }
                };
                slackSocket.onmessage = function (event) {
                    const message = JSON.parse(event.data);
                    switch (message.type) {
                        case "hello":
                            console.log("[+] Received connection from Slack RTM.");
                            break;
                        case "message":
                            console.log("[ ] Slack message:" + JSON.stringify(message));
                            callback(message);
                            break;
                    }
                };
            } else {
                console.log("[-] Bad response from Slack");
            }
        });
    }).end();
};

module.exports = function(newSlackToken, newCallback) {
    slackToken = newSlackToken;
    callback = newCallback;
    connectWithSlack();
    return {
        messageSender: function(message, channel) {
            const messageObject = {
                "id": messageId++,
                "type": "message",
                "channel": channel,
                "text": message
            };
            wsSender(JSON.stringify(messageObject));
        },
        reconnect: connectWithSlack
    };
};
