
// var game = function (gameID) {
//     this.id = gameID;
//     this.solution = [1, 2, 3, 4];
//     this.guess = [0, 0, 0, 0];
//     this.amountOfBalls = 0;
//     this.attempt = 1;
// }
"use strict";

//var clone = require('clone');

var solution = [1, 2, 3, 4];
var guess = [0, 0, 0, 0];
var amountOfBalls = 0;
var attempt = 1;
var maxAttempts = 10;

// game.prototype.addBall(id) {

function addBall(id) {
    if (amountOfBalls < 4) {
        var filename = "img/ball" + id + ".png";
        var cellId = "guess" + attempt + "-" + amountOfBalls;
        $(cellId).src = filename;
        guess[amountOfBalls] = id;
        amountOfBalls++;
    } else sout("Can't add another ball: row is already full");
}

function removeBall() {
    if (amountOfBalls > 0) {
        amountOfBalls--;
        guess[amountOfBalls] = 0;
        var cell = "guess" + attempt + "-" + amountOfBalls;
        $(cell).src = "img/egglessomelette.png";
    } else sout("Can't remove ball: there are no balls in the row")
}

function tryCheck() {
    var goAhead = true;
    for (var i = 0; i < 4; i++) if (guess[i] === 0) goAhead = false;
    if (!goAhead) sout("Can't check: each guess must contain 4 balls");
    else if (check()) sout("Congratulations!");
    if (attempt > maxAttempts) endGame();
}

// game.prototype.check = function() {
function check() {
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

function setSolution() {
    solution = [0, 0, 0, 0];
    for (let i = 1; i < 7; i++) {
        let id = "ballcell" + i;
        let method = "addBallToSolution(" + i + ")";
        $(id).setAttribute("onclick", method);
    }
    $("greenbutton").innerText = "Set";
    $("greenbutton").setAttribute("onclick", "trySet()");
    sout("Please set the solution.");
}

function addBallToSolution(ball) {
    if (amountOfBalls < 4) {
        var filename = "img/ball" + ball + ".png";
        var cellId = "guess" + attempt + "-" + amountOfBalls;
        $(cellId).src = filename;
        guess[amountOfBalls] = ball;
        amountOfBalls++;
    } else sout("Can't add another ball: row is already full");
}

function trySet() {
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

function endGame() {
    sout("You lost the game.");
    // todo: alter game state
}

function sout(string) {
    $("textfield").innerText = string;
    setTimeout(function () {
        $("textfield").innerText = " ";
    }, 2000);
}

function createAttemptRow() {
    maxAttempts++;
    // var $listItemOne = $("<li>").text("this is the first list item");
    // var $tr1 = $("<tr>");
    var $tbody = $("gametablebody");

    // var attemptRow = '<tr>';

    var attemptRow = "";

    // var insideTR1 = "";
    for (var i = 0; i < 4; i++) {
        attemptRow += '<td rowspan=2 colspan=2><img src="img/egglessomelette.png" class="guessimg" id="guess'
            + maxAttempts + '-' + i + '"></td>';
        // $($tr1).append(td);
    }
    for (var i = 0; i < 2; i++) {
        attemptRow += '<td><img src="img/egglessomelette.png" class="feedbackimg" id="fb' + maxAttempts + '-' + i + '"></td>';
        // $($tr1).append(td);
    }
    // var $tr2 = $("<tr>");
    attemptRow += '</tr><tr>';
    for (var i = 2; i < 4; i++) {
        attemptRow += '<td><img src="img/egglessomelette.png" class="feedbackimg" id="fb' + maxAttempts + '-' + i + '"></td>';
        // $($tr2).append(td);
    }
    // attemptRow += '</tr>';

    var decoded = $('<tr/>').html(text).text();
    $tbody.prepend(decoded);

    // tr = $.parseHTML(attemptRow);
    // $tbody.prepend(tr);

    // $("gametablebody").prepend(attemptRow);
    // $("gametablebody first-child").before(attemptRow);
    // $("gametablebody").prepend($tr2);
    // $("gametablebody").prepend($tr1);

    // $('gametable > tr:first').after(attemptRow);

}