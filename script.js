
const gameBoard = (function () {
    
    const rows = 3;
    const columns  = 3;
    let table = [];
   
    // Initialize the board with empty values
    for(let i=0 ; i<rows ; i++ ){
        table[i] = [];
        for(let j=0; j<columns; j++){
            table[i].push('');
        }
    }

    //Returns a **copy** of the current game board to prevent external modifications.
    function getTable () {
        return table.map(row=>[...row]);
    }

    //Resets the game board by clearing all values.
    function clearTable () {
        console.log('cleaning table process started');
        for(let i=0 ; i<rows ; i++ ){
            for(let j=0; j<columns; j++){
                table[i][j]='';
            }
        }
        console.log('table cleaned');
    }

    //Updates the board with a player's mark if the selected position is available.
    function changeTable (row, col, mark) {
        if(table[row][col] === ''){
            table[row][col] = mark;
            console.log('done')
            return true
        }else{
            console.log('that position is already taken')
            return false
        }
    }

    return {getTable, clearTable, changeTable}

})()

//Factory function to create a player.
function createPlayer (name, mark) {
    return {
        playerName: name,
        playerMark: mark,
    }
}

const gameController = (function () {

    //Creating two player instances
    const firstPlayer = createPlayer('Adrian', 'X');
    const secondPlayer = createPlayer('Raul', 'O');

    let round  = 1; // Tracks the current round number
    let playerTurn = firstPlayer; // Keeps track of whose turn it is
    let winner // Stores the winner if there is one

    //Manages a single round of play:
    function playRound (x, y, pt = playerTurn) {

        console.log(`That's round number ${round}, it's ${playerTurn.playerName}'s turn`);
        // Attempt to place the mark on the board
        const newTable = gameBoard.changeTable(x, y, pt.playerMark);
        console.log(gameBoard.getTable());
         // Check if the move resulted in a win
        winner = checkRoundResult();

        if(winner){

            console.log(`We have a champion, the winner is ${playerTurn.playerName}`)
            resetGame()
            return
        }
        //If it's the last round and no one has won, it's a tie
        if (round===9 && !winner){

            console.log(`It's a Tie!`)
            resetGame()
            return
        }

         // If the move was invalid, don't proceed
        if(newTable === false){
            return
        }else{
            // Proceed to the next round
            round++;
            playerTurn = playerTurn === firstPlayer ? secondPlayer : firstPlayer;
        }
    }

    //Checks the board to determine if there is a winner.
    function checkRoundResult () {
        const board = gameBoard.getTable();

        const winningConditions = [
            // Rows
            [board[0][0], board[0][1], board[0][2]],
            [board[1][0], board[1][1], board[1][2]],
            [board[2][0], board[2][1], board[2][2]],
            // Columns
            [board[0][0], board[1][0], board[2][0]],
            [board[0][1], board[1][1], board[2][1]],
            [board[0][2], board[1][2], board[2][2]],
            // Diagonals
            [board[0][0], board[1][1], board[2][2]],
            [board[0][2], board[1][1], board[2][0]]
        ];
       // Check if any winning condition is met 
       const winner = winningConditions.some(condition => condition.every(cell => cell === `${playerTurn.playerMark}`));
        
       return winner
    }
    
    //Resets the game state to start a new match.
    function resetGame (){
        round = 1;
        playerTurn = firstPlayer;
        gameBoard.clearTable()
    }

    return {playRound};
})()

