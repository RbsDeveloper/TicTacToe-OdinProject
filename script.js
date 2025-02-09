const board = document.getElementById('board')
const displayMsg = document.getElementById('displayMsg');
const actionZone = document.getElementById('game-container');
const form = document.getElementById('form');
const modal = document.getElementById('modal');
const gameMsg = document.getElementById('gameMsg')
const playAgainBtn =  document.getElementById('playAgain');
const newPlayersBtn =  document.getElementById('newPlayers');
const footer = document.getElementById('footer');

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

    //Storing two player instances
    let firstPlayer;
    let secondPlayer;

    let round  = 1; // Tracks the current round number
    let playerTurn; // Keeps track of whose turn it is
    let roundHasWinner // Stores the winner if there is one

    // Initializes the game with two players and sets player 1 as the first turn
    function startGame(p1Name, p2Name) {
        firstPlayer = createPlayer(p1Name || 'Player 1', 'X');
        secondPlayer = createPlayer(p2Name || 'Player 2', 'O');
        playerTurn = firstPlayer;

        return {firstPlayer, secondPlayer, playerTurn};
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
       const existWinner = winningConditions.some(condition => condition.every(cell => cell === `${playerTurn.playerMark}`));

       if(existWinner){
        console.log(`We have a champion, the winner is ${playerTurn.playerName}`);
        return existWinner
        }
        //If it's the last round and no one has won, it's a tie
        if (round===9 && !existWinner){
            console.log(`It's a Tie!`);
            //resetGame()
            return 'tie';
        }
    }

    //Manages a single round of play:
    function playRound (x, y, pt = playerTurn) {

        console.log(`It's ${playerTurn.playerName}'s turn`);
        // Attempt to place the mark on the board
        const newTable = gameBoard.changeTable(x, y, pt.playerMark);
        console.log(gameBoard.getTable());
         // Check if the move resulted in a win
        roundHasWinner = checkRoundResult();

         // If the move was invalid, don't proceed
        if(newTable === false){
            return
        }else{
            // Proceed to the next round
            round++;
            playerTurn = playerTurn === firstPlayer ? secondPlayer : firstPlayer;
        }
        return {pt, roundHasWinner, round};
    }
    
    //Resets the game state to start a new match.
    function resetGame (){
        round = 1;
        playerTurn = firstPlayer;
        gameBoard.clearTable()
    }

    // Returns the player whose turn it is
    function getCurrentPlayer() {
        return playerTurn;
    }

    return {startGame, playRound, resetGame, checkRoundResult, getCurrentPlayer};
})()

const displayCotroller = (function () {
    modal.showModal()

    // Creates the visual representation of the board
    const table = gameBoard.getTable();
    table.forEach((row, rowIndex) => {
        row.forEach((el, colIndex)=>{
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            board.appendChild(cell);
        })
    });

    //Used when we have to clean/reset the board;
    function resetVisualBoard() {
        document.querySelectorAll('.cell').forEach(cell=>{
            cell.innerText = '';
        });
    }

    //Used to play the game/ interact with the board;
    function handleCellClick(e){

        const cell = e.target;
        if(!cell.classList.contains('cell')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        //console.log(`cell cliked ar row ${row} and col ${col}`);

        const gameStats = gameController.playRound(row, col);

        if(cell.innerText === ''){
            cell.innerText = gameStats.pt.playerMark;
            
        }else{
            // Add shaking animation for invalid moves
            cell.classList.add('shake');
            setTimeout(() => {
                cell.classList.remove('shake');
            }, 300);
            return
        }

        // Update game message based on round results
        if(gameStats.roundHasWinner===true){
            gameMsg.innerText= `Congratulations ${gameStats.pt.playerName}, you're the winner!`;
            board.style.pointerEvents = 'none'
        }else if(gameStats.roundHasWinner==='tie'){
            gameMsg.innerText = `hei, it's a tie`;
            board.style.pointerEvents = 'none'
        }else {
            gameMsg.innerText = `It's ${gameController.getCurrentPlayer().playerName}'s turn`;
        }
    }

     // Handles form submission to start the game
    form.addEventListener('submit', (e)=>{
        e.preventDefault()
        const firstPlayer = document.getElementById('player1').value;
        const secondPlayer = document.getElementById('player2').value;
        gameController.startGame(firstPlayer, secondPlayer);
        modal.close();
        gameMsg.innerText = `It's ${firstPlayer}'s turn!`;
        actionZone.classList.remove('hidden');
        footer.classList.remove('hidden');
    })

    // Attach event listener to board cells
    board.addEventListener('click', handleCellClick);

    // Resets the board and game state when "Play Again" is clicked
    playAgainBtn.addEventListener('click', ()=>{

        resetVisualBoard()

        gameController.resetGame();

        board.style.pointerEvents = 'auto'
        gameMsg.innerText = `It's ${document.getElementById('player1').value}'s turn!`;
        console.log('resettedddd!')
    })
    
    // Handles "New Players" button click to restart with new names
    newPlayersBtn.addEventListener('click', ()=>{
        resetVisualBoard()
        gameController.resetGame()
        actionZone.classList.add('hidden');
        footer.classList.add('hidden');
        modal.showModal()
        document.getElementById('player1').value = '';
        document.getElementById('player2').value = '';
        gameMsg.innerText = `It's ${document.getElementById('player1').value}'s turn!`;
    })
})()


