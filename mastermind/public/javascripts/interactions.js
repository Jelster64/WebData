/* basic constructor of game state */
function GameState(socket) {
    this.playerType = null;
    this.guess = [0, 0, 0, 0];
    this.solution = [0, 0, 0, 0];
    this.amountOfBalls = 0;
    this.attempt = 1;
    this.maxAttempts = 10;

    this.getPlayerType = function () {
        return this.playerType;
    };

    this.setPlayerType = function (p) {
        console.assert(typeof p == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof p);
        this.playerType = p;
    };

    this.setSolutionPlayerB = function (s) {
        // s should be an array containing 4 integers
        this.solution = s;
    };

    this.getSolution = function () {
        return this.solution;
    }

    this.getGuess = function () {
        return this.guess;
    }

    this.addBall = function (id) {
        console.log(this.amountOfBalls);
        console.log(this);
        if (this.amountOfBalls < 4) {
            var filename = "img/ball" + id + ".png";
            var cellId = "guess" + this.attempt + "-" + this.amountOfBalls;
            $(cellId).src = filename;
            this.guess[this.amountOfBalls] = id;
            this.amountOfBalls++;
        } else sout("Can't add another ball: row is already full");
    }

    this.removeBall = function () {
        console.log(this.amountOfBalls);
        if (this.amountOfBalls > 0) {
            this.amountOfBalls--;
            this.guess[this.amountOfBalls] = 0;
            var cell = "guess" + this.attempt + "-" + this.amountOfBalls;
            $(cell).src = "img/egglessomelette.png";
        } else sout("Can't remove ball: there are no balls in the row");
    }

    this.tryCheck = function () {
        var goAhead = true;
        for (var i = 0; i < 4; i++) if (this.guess[i] == 0) goAhead = false;
        if (!goAhead) sout("Can't check: each guess must contain 4 balls");
        else if (this.check()) {
            sout("Congratulations!");
            this.disableBallButtons();
            this.endGame();
        }
        if (this.attempt > this.maxAttempts) this.endGame();
    }

    this.check = function () {
        var amountCorrect = 0;
        var solutionClone = [];
        for (var i = 0; i < 4; i++) solutionClone[i] = this.solution[i];
        var res = [0, 0, 0, 0];
        var resIndex = 0;
        // 1 black: right color, right position
        for (var i = 0; i < 4; i++) {
            if (solutionClone[i] === this.guess[i] && solutionClone[i] != 0) {
                res[resIndex++] = 1;
                solutionClone[i] = 0;
                this.guess[i] = 0;
                amountCorrect++;
            }
        }
        // 2 white: right color, wrong position
        for (var i = 0; i < 4; i++) {
            if (solutionClone[i] != 0) {
                for (var j = 0; j < 4; j++) {
                    if (this.guess[j] != 0 && solutionClone[i] === this.guess[j]) {
                        solutionClone[i] = 0;
                        this.guess[j] = 0;
                        res[resIndex++] = 2;
                    }
                }
            }
        }
        // display res in html
        for (var i = 0; i < 4; i++) {
            var cellId = "fb" + this.attempt + "-" + i;
            switch (res[i]) {
                case 0:
                    break;
                case 1:
                    $(cellId).src = "img/ballblack.png";
                    break;
                case 2:
                    $(cellId).src = "img/ballwhite.png";
                    break;
                default:
                    sout("Either there's a mistake in the code, or you've been hacking. Cheater.");
                    break;
            }
        }
        if (amountCorrect == 4) return true;
        this.attempt++;
        this.amountOfBalls = 0;
        console.log("point is reached");
        return false;
    }

    this.addBallToSolution = function (ball) {
        console.log("amountOfBalls is " + this.amountOfBalls);
        console.log(this);
        if (this.amountOfBalls < 4) {
            var filename = "img/ball" + ball + ".png";
            var cellId = "guess" + this.attempt + "-" + this.amountOfBalls;
            $(cellId).src = filename;
            this.guess[this.amountOfBalls] = ball;
            this.amountOfBalls++;
        } else sout("Can't add another ball: row is already full");
    }

    this.trySet = function () {
        var goAhead = true;
        for (let i = 0; i < 4; i++) if (this.guess[i] === 0) goAhead = false;
        if (!goAhead) sout("Can't set: each solution must contain 4 balls");
        else {
            for (let i = 0; i < 4; i++) this.solution[i] = this.guess[i];
            for (let i = 0; i < 4; i++) this.removeBall();
            this.disableBallButtons();
            this.disableButtons();
            sout("Solution set.");
        }
    }

    this.setSolution = function () {
        for (let i = 1; i < 7; i++) {
            let id = "ballcell" + i;
            $(id).addEventListener('click', this.addBallToSolution.bind(this, i));
        }
        $("greenbutton").innerText = "Set";
        $("greenbutton").addEventListener('click', this.trySet.bind(this));
        $("redbutton").addEventListener('click', this.removeBall.bind(this));
        sout("Please set the solution.");
    }

    this.isSolutionSet = function () {
        for (let i = 0; i < 4; i++) if (this.solution[i] === 0) return false;
        return true;
    }

    this.disableButtons = function () {
        $("greenbutton").setAttribute("class", "pure-button check-button pure-button-disabled");
        $("redbutton").setAttribute("class", "pure-button delete-button pure-button-disabled");
    }

    this.enableButtons = function () {
        $("greenbutton").setAttribute("class", "pure-button check-button");
        $("redbutton").setAttribute("class", "pure-button delete-button");
    }

    this.disableBallButtons = function () {
        for (let i = 1; i < 7; i++) {
            let id = "ballcell" + i;
            $(id).replaceWith($(id).clone());
        }
    }

    this.endGame = function () {
        
    }
}

function sout(string) {
    $("textfield").innerText = string;
    setTimeout(function () {
        $("textfield").innerText = " ";
    }, 2000);
}

function soutPerm(string) {
    $("textfield").innerText = string;
}

//set everything up, including the WebSocket
(function setup() {
    var socket = new WebSocket("ws://localhost:3000");
    var gs = new GameState(socket);






    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);

        //set player type
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {

            gs.setPlayerType(incomingMsg.data);//should be "A" or "B"

            //if player type is A, (1) pick a word, and (2) sent it to the server
            if (gs.getPlayerType() == "A") {

                //TODO: let player A set solution and disable his input from then on

                soutPerm("Player A: please set the solution.");
                // for (let i = 1; i < 7; i++) {
                //     let id = "ballcell" + i;
                //     document.getElementById(id).addEventListener("click", gs.addBallToSolution(i));
                // }
                gs.setSolution();

                // while (!gs.isSolutionSet()) {
                //     // do nothing, just wait
                //     setTimeout(function () {
                //         console.log("Waiting until solution is set...");
                //     }, 2000);
                // }
                var sendSolution = function () {
                    let outgoingMsg = Messages.O_SOLUTION;
                    outgoingMsg.data = gs.getSolution();
                    socket.send(JSON.stringify(outgoingMsg));
                }
                $("greenbutton").addEventListener("click", sendSolution.bind(this));
            }
            else {
                gs.disableButtons();
                soutPerm("Player B: please wait for player A to set the solution.");
            }
        }

        //Player B: wait for solution and then start guessing ...
        if (incomingMsg.type == Messages.T_SOLUTION && gs.getPlayerType() == "B") {
            gs.setSolutionPlayerB(incomingMsg.data);
            gs.enableButtons();

            var sendBall = function (ball) {
                let outgoingMsg = Messages.O_ADD_BALL;
                outgoingMsg.data = ball;
                socket.send(JSON.stringify(outgoingMsg));
            }
            for (let i = 1; i < 7; i++) {
                let id = "ballcell" + i;
                $(id).addEventListener('click', gs.addBall.bind(gs, i));
                $(id).addEventListener('click', sendBall.bind(gs, i));
            }

            $("greenbutton").addEventListener('click', gs.tryCheck.bind(gs));
            var sendCheck = function () {
                let outgoingMsg = Messages.O_MAKE_A_GUESS;
                outgoingMsg.data = 9;
                socket.send(JSON.stringify(outgoingMsg));
            }
            $("greenbutton").addEventListener('click', sendCheck.bind(gs));
            
            $("redbutton").addEventListener('click', gs.removeBall.bind(gs));
            var sendDelete = function () {
                let outgoingMsg = Messages.O_REMOVE_BALL;
                outgoingMsg.data = 9;
                socket.send(JSON.stringify(outgoingMsg));
            }
            $("redbutton").addEventListener('click', sendDelete.bind(gs));

            soutPerm("Player B: start guessing.");
        }

        //Player A: interpret when player B adds a ball
        if (incomingMsg.type == Messages.T_ADD_BALL && gs.getPlayerType() == "A") {
            gs.addBall(incomingMsg.data);
        }

        //Player A: interpret when player B removes a ball
        if (incomingMsg.type == Messages.T_REMOVE_BALL && gs.getPlayerType() == "A") {
            gs.removeBall();
        }

        //Player A: wait for guesses and update the board ...
        if (incomingMsg.type == Messages.T_MAKE_A_GUESS && gs.getPlayerType() == "A") {
            gs.tryCheck();
        }
    };

    socket.onopen = function () {
        socket.send("{}");
    };

    //server sends a close event only if the game was aborted from some side
    // socket.onclose = function(){
    //     if(gs.whoWon()==null){
    //         sb.setStatus(Status["aborted"]);
    //     }
    // };

    socket.onerror = function () {
    };
})(); //execute immediately
