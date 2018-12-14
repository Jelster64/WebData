(function(exports){
    
    /* 
     * Client to server: game is complete, the winner is ... 
     */
    exports.T_GAME_WON_BY = "GAME-WON-BY";             
    exports.O_GAME_WON_BY = {
        type: exports.T_GAME_WON_BY,
        data: null
    };

    /*
     * Server to client: abort game (e.g. if second player exited the game) 
     */
    exports.O_GAME_ABORTED = {                          
        type: "GAME-ABORTED"
    };
    exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

    /*
    * Server to client: choose solution
    */
   exports.O_CHOOSE = { type: "CHOOSE-SOLUTION" };
   exports.S_CHOOSE = JSON.stringify(exports.O_CHOOSE);

    /*
     * Server to client: set as player A 
     */
    exports.T_PLAYER_TYPE = "PLAYER-TYPE";
    exports.O_PLAYER_A = {                            
        type: exports.T_PLAYER_TYPE,
        data: "A"
    };
    exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

    /* 
     * Server to client: set as player B 
     */
    exports.O_PLAYER_B = {                            
        type: exports.T_PLAYER_TYPE,
        data: "B"
    };
    exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

	 /* 
     * Player A to server OR server to Player B: this is the solution
     */
    exports.T_SOLUTION = "SET-SOLUTION";
    exports.O_SOLUTION = {                         
        type: exports.T_SOLUTION,
        data: null
    };
    //exports.S_SOLUTION does not exist, as we always need to fill the data property

	 /* 
	 * Player B to server OR server to Player A: add ball
	 */
    exports.T_ADD_BALL = "ADD-BALL";         
    exports.O_ADD_BALL = {
        type: exports.T_ADD_BALL,
        data: null
    };
    //exports.S_ADD_BALL does not exist, as data needs to be set

    /* 
	 * Player B to server OR server to Player A: check if guess is correct
	 */
    exports.T_MAKE_A_GUESS = "MAKE-A-GUESS";         
    exports.O_MAKE_A_GUESS = {
        type: exports.T_MAKE_A_GUESS,
        data: null
    };
    //exports.S_MAKE_A_GUESS does not exist, as data needs to be set

    /* 
	 * Player B to server OR server to Player A: remove ball
	 */
    exports.T_REMOVE_BALL = "REMOVE-BALL";         
    exports.O_REMOVE_BALL = {
        type: exports.T_REMOVE_BALL,
        data: null
    };
    //exports.S_REMOVE_BALL does not exist, as data needs to be set

	 /* 
     * Server to Player A & B: game over with result won/loss 
     */
    exports.T_GAME_OVER = "GAME-OVER";              
    exports.O_GAME_OVER = {
        type: exports.T_GAME_OVER,
        data: null
    };


}(typeof exports === "undefined" ? this.Messages = {} : exports));
//if exports is undefined, we are on the client; else the server