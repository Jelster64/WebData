/* 
 In-memory game statistics "tracker".
 As future work, this object should be replaced by a DB backend.
*/

var gameStatus = {
    since : Date.now(),     /* since we keep it simple and in-memory, keep track of when this object was created */
    gamesInitialized : 0,   /* number of games initialized */
    gamesWonByA : 0,        /* number of games won by the codemaker */
    gamesWonByB : 0         /* number of games won by the codebreaker */
};

module.exports = gameStatus;