var express = require("express");
var http = require("http");
var credentials = require("./credentials");
var websocket = require("ws");

var messages = require("./public/javascripts/messages");
var gameStatus = require("./statTracker");
var Game = require("./game");
var cookies = require("cookie-parser");

var port = process.argv[2];
var app = express();
app.use(cookies(credentials.cookieSecret));

app.use(express.static(__dirname + "/public"));

// app.get("/", (req, res) => {
//     res.sendFile("splash.html", { root: "./public" });
// });

app.set('view engine', 'ejs')
app.get('/', (req, res) => {
    var count = 0;
    if (!isNaN(req.signedCookies.visitCount)) {
        //if there's already a cookie, update the count
        count = req.signedCookies.visitCount;
    }
    res.render('splash.ejs', { gamesInitialized: gameStatus.gamesInitialized, gamesWonByA: gameStatus.gamesWonByA, gamesWonByB: gameStatus.gamesWonByB, count: count });
})

app.get("/play", (req, res) => {
    var count = 0;
    if (!isNaN(req.signedCookies.visitCount)) {
        //if there's already a cookie, update the count
        count = req.signedCookies.visitCount;
    }
    count++;
    res.cookie("visitCount", count, { signed: true });
    console.log(count);
    // res.send();

    res.sendFile("game.html", { root: "./public" });
});

var server = http.createServer(app);
const wss = new websocket.Server({ server });

var websockets = {};//property: websocket, value: game

var currentGame = new Game(gameStatus.gamesInitialized++);
var connectionID = 0;//each websocket receives a unique ID








wss.on("connection", function connection(ws) {

    /*
     * two-player game: every two players are added to the same game
     */
    let con = ws;
    con.id = connectionID++;
    let playerType = currentGame.addPlayer(con);
    websockets[con.id] = currentGame;

    console.log("Player %s placed in game %s as %s", con.id, currentGame.id, playerType);

    /*
     * inform the client about its assigned player type
     */
    con.send((playerType == "A") ? messages.S_PLAYER_A : messages.S_PLAYER_B);

    /*
     * client B receives the solution (if already available)
     */
    if (playerType == "B" && currentGame.getSolution() != null && currentGame.getSolution() != [0, 0, 0, 0]) {
        let msg = messages.O_SOLUTION;
        msg.data = currentGame.getSolution();
        con.send(JSON.stringify(msg));
    }

    /*
     * once we have two players, there is no way back; 
     * a new game object is created;
     * if a player now leaves, the game is aborted (player is not preplaced)
     */
    if (currentGame.hasTwoConnectedPlayers()) {
        currentGame = new Game(gameStatus.gamesInitialized++);
    }

    /*
     * message coming in from a player:
     *  1. determine the game object
     *  2. determine the opposing player OP
     *  3. send the message to OP 
     */
    con.on("message", function incoming(message) {

        let oMsg = JSON.parse(message);

        let gameObj = websockets[con.id];
        let isPlayerA = (gameObj.playerA == con) ? true : false;

        if (isPlayerA) {

            /*
             * player A cannot do a lot, just send the solution;
             * if player B is already available, send message to B
             */
            if (oMsg.type == messages.T_SOLUTION) {
                gameObj.setSolution(oMsg.data);

                if (gameObj.hasTwoConnectedPlayers()) {
                    gameObj.playerB.send(message);
                }
            }

        }
        else {
            /*
             * player B automatically lets the server know that he joined;
             * this is forwarded to A
             */
            if (oMsg.type == messages.T_PLAYER_B_JOINED) {
                gameObj.playerA.send(message);
            }

            /*
             * player B can add a ball;
             * this is forwarded to A
             */
            if (oMsg.type == messages.T_ADD_BALL) {
                gameObj.playerA.send(message);
            }

            /*
             * player B can remove a ball;
             * this is forwarded to A
             */
            if (oMsg.type == messages.T_REMOVE_BALL) {
                gameObj.playerA.send(message);
            }

            /*
             * player B can make a guess; 
             * this guess is forwarded to A
             */
            if (oMsg.type == messages.T_MAKE_A_GUESS) {
                gameObj.playerA.send(message);
            }

            /*
             * player B can state who won/lost
             */
            if (oMsg.type == messages.T_GAME_WON_BY) {
                gameObj.setStatus(oMsg.data);

                //game was won by somebody, update statistics
                switch (oMsg.data) {
                    case "A":
                        gameStatus.gamesWonByA++;
                        break;
                    case "B":
                        gameStatus.gamesWonByB++;
                        break;
                }
            }
        }
    });

    con.on("close", function (code) {

        /*
         * code 1001 means almost always closing initiated by the client;
         * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
         */
        console.log(con.id + " disconnected ...");

        if (code == "1001") {
            /*
            * if possible, abort the game; if not, the game is already completed
            */
            let gameObj = websockets[con.id];

            if (gameObj.isValidTransition(gameObj.gameState, "ABORTED")) {
                gameObj.setStatus("ABORTED");

                /*
                 * determine whose connection remains open;
                 * close it
                 */
                try {
                    gameObj.playerA.close();
                    gameObj.playerA = null;
                }
                catch (e) {
                    console.log("Player A closing: " + e);
                }

                try {
                    gameObj.playerB.close();
                    gameObj.playerB = null;
                }
                catch (e) {
                    console.log("Player B closing: " + e);
                }
            }

        }
    });
});

server.listen(port);