const slackToken = process.env.SLACK_TOKEN;

const http = require("http");
const express = require("express");
const app = express();
const httpServer = http.Server(app);
const io = require("socket.io")(httpServer);
const engine = require("./engine.js")(io);
const slack = require("./slack.js")(slackToken, engine.messageCallback);
engine.setMessageSender(slack.messageSender);

app.get('/reset-slack', function(req, res){
    slack.reconnect();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({response: "ok"}));
});
app.get('/settings.json', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(engine.settings()));
});
app.get('/profiles.json', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    engine.profiles(function(profiles){
        res.send(JSON.stringify(profiles));
    });
});
app.use('/', express.static(__dirname + '/dist/www'));
app.use('/js', express.static(__dirname + '/dist/www/js'));
app.use('/css', express.static(__dirname + '/dist/www/css'));
app.use('/img', express.static(__dirname + '/dist/www/img'));
app.use("*", function(req, res){
    res.sendFile(__dirname + '/dist/www/' + "404.html");
});

io.on('connection', function(socket){
    console.log("[+] Client connected: " + socket.id);
    socket.on('disconnect', function(){
        console.log("[ ] Client disconnected: " + socket.id);
    });
});


httpServer.listen(80, function(){
    console.log("HTTP server listening on :80");
});
