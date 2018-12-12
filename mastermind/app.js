var express = require("express");
var http = require("http");
var websocket = require("ws");

var messages = require("./public/javascripts/messages");

var port = process.argv[2];
var app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile("splash.html", {root: "./public"});
});

app.get("/play", (req, res) => {
    res.sendFile("game.html", {root: "./public"});
});

http.createServer(app).listen(port);