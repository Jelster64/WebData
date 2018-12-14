/* basic constructor of game state */
function GameState(socket){
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

    // this.setSolution = function (s) {
    //     // s should be an array containing 4 integers
    //     this.solution = s;
    // };

    this.getSolution = function () {
        return this.solution;
    }

    this.addBall = function (id) {
        if (amountOfBalls < 4) {
            var filename = "img/ball" + id + ".png";
            var cellId = "guess" + attempt + "-" + amountOfBalls;
            $(cellId).src = filename;
            guess[amountOfBalls] = id;
            amountOfBalls++;
        } else sout("Can't add another ball: row is already full");
    }
    
    this.removeBall = function () {
        if (amountOfBalls > 0) {
            amountOfBalls--;
            guess[amountOfBalls] = 0;
            var cell = "guess" + attempt + "-" + amountOfBalls;
            $(cell).src = "img/egglessomelette.png";
        } else sout("Can't remove ball: there are no balls in the row")
    }
    
    this.tryCheck = function () {
        if (getPlayerType() === "A") {
            sout("You're the codemaker. You can't use this button right now.")
            return;
        }
        var goAhead = true;
        for (var i = 0; i < 4; i++) if (guess[i] === 0) goAhead = false;
        if (!goAhead) sout("Can't check: each guess must contain 4 balls");
        else if (check()) sout("Congratulations!");
        if (attempt > maxAttempts) endGame();
    }
    
    this.check = function () {
        if (solution === guess) {
            // in html, change all cells to black balls
            for (var i = 0; i < 4; i++) {
                var cellId = "guess" + attempt + "-" + i;
                $(cellId).src = "img/ballblack.png";
            }
            return true;
        }
    
        var solutionClone = [];
        for (var i = 0; i < 4; i++) solutionClone[i] = solution[i];
        var res = [0, 0, 0, 0];
        var resIndex = 0;
        // 1 black: right color, right position
        for (var i = 0; i < 4; i++) {
            if (solutionClone[i] === guess[i] && solutionClone[i] != 0) {
                res[resIndex++] = 1;
                solutionClone[i] = 0;
                guess[i] = 0;
            }
        }
        // 2 white: right color, wrong position
        for (var i = 0; i < 4; i++) {
            if (solutionClone[i] != 0) {
                for (var j = 0; j < 4; j++) {
                    if (guess[j] != 0 && solutionClone[i] === guess[j]) {
                        solutionClone[i] = 0;
                        guess[j] = 0;
                        res[resIndex++] = 2;
                    }
                }
            }
        }
        // display res in html
        for (var i = 0; i < 4; i++) {
            var cellId = "fb" + attempt + "-" + i;
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
                    sout("Either there's a mistake in the code, or you've been messing with memory addresses. Cheater.");
                    break;
            }
        }
        attempt++;
        amountOfBalls = 0;
        return false;
    }


    this.setSolution = function () {
        for (let i = 1; i < 7; i++) {
            let id = "ballcell" + i;
            let method = "addBallToSolution(" + i + ")";
            $(id).setAttribute("onclick", method);
        }
        $("greenbutton").innerText = "Set";
        $("greenbutton").setAttribute("onclick", "trySet()");
        sout("Please set the solution.");
    }
    
    this.addBallToSolution = function (ball) {
        if (amountOfBalls < 4) {
            var filename = "img/ball" + ball + ".png";
            var cellId = "guess" + attempt + "-" + amountOfBalls;
            $(cellId).src = filename;
            guess[amountOfBalls] = ball;
            amountOfBalls++;
        } else sout("Can't add another ball: row is already full");
    }
    
    this.trySet = function () {
        var goAhead = true;
        for (let i = 0; i < 4; i++) if (guess[i] === 0) goAhead = false;
        if (!goAhead) sout("Can't set: each solution must contain 4 balls");
        else {
            for (let i = 0; i < 4; i++) solution[i] = guess[i];
            for (let i = 0; i < 4; i++) removeBall();
            for (let i = 1; i < 7; i++) {
                let id = "ballcell" + i;
                let method = "addBall(" + i + ")";
                $(id).setAttribute("onclick", method);
            }
            $("greenbutton").innerText = "Check";
            $("greenbutton").setAttribute("onclick", "tryCheck()");
            sout("Solution set.");
        }
    }

    this.isSolutionSet = function () {
        for (let i = 0; i < 4; i++) if (solution[i] === 0) return false;
        return true;
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
(function setup(){
    var socket = new WebSocket("ws://localhost:3000");
    var gs = new GameState(socket);





    
    socket.onmessage = function (event) {

        let incomingMsg = JSON.parse(event.data);
 
        //set player type
        if (incomingMsg.type == Messages.T_PLAYER_TYPE) {
            
            gs.setPlayerType( incomingMsg.data );//should be "A" or "B"

            //if player type is A, (1) pick a word, and (2) sent it to the server
            if (gs.getPlayerType() == "A") {

                //TODO: let player A set solution and disable his input from then on

                soutPerm("Player A: please set the solution.");
                setSolution();

                while (!gs.isSolutionSet()) {
                    // do nothing, just wait
                }

                let outgoingMsg = Messages.O_SOLUTION;
                outgoingMsg.data = gs.getSolution();
                socket.send(JSON.stringify(outgoingMsg));
            }
            else {
                soutPerm("Player B: please wait for player A to set the solution.");
            }
        }

        //Player B: wait for target word and then start guessing ...
        if( incomingMsg.type == Messages.T_TARGET_WORD && gs.getPlayerType() == "B"){
            gs.setTargetWord(incomingMsg.data);

            sb.setStatus(Status["player2Intro"]);
            gs.initializeVisibleWordArray(); // initialize the word array, now that we have the word
            ab.initialize();
            vw.setWord(gs.getVisibleWordArray());
        }


        //Player A: wait for guesses and update the board ...
        if( incomingMsg.type == Messages.T_MAKE_A_GUESS && gs.getPlayerType()=="A"){
            sb.setStatus(Status["guessed"] + incomingMsg.data);
            gs.updateGame(incomingMsg.data);
        }
    };

    socket.onopen = function(){
        socket.send("{}");
    };
    
    //server sends a close event only if the game was aborted from some side
    socket.onclose = function(){
        if(gs.whoWon()==null){
            sb.setStatus(Status["aborted"]);
        }
    };

    socket.onerror = function(){  
    };
})(); //execute immediately
