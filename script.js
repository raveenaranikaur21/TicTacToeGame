document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('[data-cell]');
    const board = document.getElementById('gameBoard');
    const statusText = document.getElementById('statusText');
    const mainRestartButton = document.querySelector('.main-restart');
    const popupRestartButton = document.querySelector('.popup-restart');
    const winningLine = document.querySelector('.winning-line');
    const winPopup = document.getElementById('winPopup');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const gameTitle = document.getElementById('gameTitle');
    const playerNamesSection = document.getElementById('playerNamesSection');
    const startGameButton = document.getElementById('startGameButton');
    const player1NameInput = document.getElementById('player1Name');
    const player2NameInput = document.getElementById('player2Name');
    const gameHistory = document.getElementById('gameHistory');
    const gameButtons = document.querySelector('.game-buttons');
    const quitGameButtons = document.querySelectorAll('.quit-game');
    const popupQuitButton = document.querySelector('.popup-quit');


    const clickSound = new Audio('assets/sounds/click.mp3');
    const winSound = new Audio('assets/sounds/win.mp3');
    const drawSound = new Audio('assets/sounds/draw.mp3');

    [clickSound, winSound, drawSound].forEach(sound => {
        sound.addEventListener('error', () => {
            console.error(`Failed to load sound: ${sound.src}`);
        });
    });

    let confettiInstance = null;
    if (confettiCanvas && window.confetti) {
        confettiInstance = window.confetti.create(confettiCanvas, { resize: true, useWorker: true });
    } else {
        console.error('Confetti library not loaded or confettiCanvas not found.');
    }


    const WINNING_COMBINATIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];


    let currentPlayer = 'x';
    let isGameActive = false;
    let player1Name = 'Player X';
    let player2Name = 'Player O';
    let gameMode = 'two-player'; 

 
    const gameModeRadios = document.getElementsByName('mode');

    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            gameMode = radio.value;
            if (gameMode === 'single-player') {
                player2NameInput.value = 'Computer';
                player2NameInput.disabled = true;
            } else {
                player2NameInput.disabled = false;
                player2NameInput.value = '';
            }
        });
    });


    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            player1Name = player1NameInput.value.trim() || 'Player X';
            
            if (gameMode === 'two-player') {
                player2Name = player2NameInput.value.trim() || 'Player O';
            } else {
                player2Name = 'Computer';
            }

            if (gameTitle) {
                gameTitle.textContent = 'Tic Tac Toe';
            } else {
                console.error('gameTitle element not found.');
            }

            if (playerNamesSection) {
                playerNamesSection.style.display = 'none';
            } else {
                console.error('playerNamesSection element not found.');
            }

            if (board) {
                board.style.display = 'grid';
            } else {
                console.error('Board element not found.');
            }

            startGame();

            if (statusText) {
                statusText.textContent = `${player1Name} vs ${player2Name}`;
                statusText.style.display = 'block';
            } else {
                console.error('statusText element not found.');
            }

     
            if (gameMode === 'single-player' && currentPlayer === 'o' && isGameActive) {
                aiMove();
            }
        });
    } else {
        console.error('startGameButton element not found.');
    }
    

    function handleCellClick(e) {
        const cell = e.target;
        if (cell.classList.contains('x') || cell.classList.contains('o') || !isGameActive) {
            return;
        }


        cell.setAttribute('data-symbol', currentPlayer.toUpperCase());
        cell.classList.add(currentPlayer);

   
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(error => {
                console.error('Error playing clickSound:', error);
            });
        }

        if (checkWin()) {
            if (statusText) {
                statusText.textContent = `${currentPlayer === 'x' ? player1Name : player2Name} Wins!`;
            }
            if (winSound) {
                winSound.currentTime = 0;
                winSound.play().catch(error => {
                    console.error('Error playing winSound:', error);
                });
            }
            isGameActive = false;
            displayWinningLine();
            showWinPopup();
            triggerConfetti();
            updateGameHistory(currentPlayer === 'x' ? player1Name : player2Name);
            return;
        }

        if (isDraw()) {
            if (statusText) {
                statusText.textContent = "It's a Draw!";
            }
            if (drawSound) {
                drawSound.currentTime = 0;
                drawSound.play().catch(error => {
                    console.error('Error playing drawSound:', error);
                });
            }
            isGameActive = false;
            showEndButtons();
            updateGameHistory(null);
            return;
        }

  
        currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
        updateStatusText();


        if (gameMode === 'single-player' && currentPlayer === 'o' && isGameActive) {
            aiMove();
        }
    }

   
    function checkWin() {
        return WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentPlayer);
            });
        });
    }


    function isDraw() {
        return [...cells].every(cell => {
            return cell.classList.contains('x') || cell.classList.contains('o');
        });
    }

 
    function startGame() {
        currentPlayer = 'x';
        isGameActive = true;
        updateStatusText();
        cells.forEach(cell => {
            cell.classList.remove('x');
            cell.classList.remove('o');
            cell.removeAttribute('data-symbol');
        });
        if (board) {
            board.className = 'board';
        }
        if (winningLine) {
            winningLine.style.width = '0';
            winningLine.style.transform = 'rotate(0deg)';
            winningLine.style.top = '0';
            winningLine.style.left = '0';
        }
        hideWinPopup();
        hideEndButtons();
        if (confettiInstance) {
            confettiInstance.reset();
        }

        if (gameMode === 'single-player' && currentPlayer === 'o' && isGameActive) {
            aiMove();
        }
    }


    function updateStatusText() {
        if (statusText) {
            statusText.textContent = `${currentPlayer === 'x' ? player1Name : player2Name}'s Turn`;
            statusText.style.color = currentPlayer === 'x' ? '#e74c3c' : '#2ecc71';
        } else {
            console.error('statusText element not found.');
        }
    }


    function triggerConfetti() {
        if (confettiInstance) {
            confettiInstance({ particleCount: 150, spread: 60, origin: { y: 0.6 } });
        } else {
            console.error('Confetti not initialized.');
        }
    }


    function displayWinningLine() {
        const winningCombination = WINNING_COMBINATIONS.find(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentPlayer);
            });
        });

        if (!winningCombination || !winningLine || !board) return;

        const [a, b, c] = winningCombination;
        const cellA = cells[a].getBoundingClientRect();
        const cellC = cells[c].getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        const startX = cellA.left + cellA.width / 2 - boardRect.left;
        const startY = cellA.top + cellA.height / 2 - boardRect.top;
        const endX = cellC.left + cellC.width / 2 - boardRect.left;
        const endY = cellC.top + cellC.height / 2 - boardRect.top;

        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        winningLine.style.width = `${length}px`;
        winningLine.style.transform = `rotate(${angle}deg)`;
        winningLine.style.top = `${startY}px`;
        winningLine.style.left = `${startX}px`;

        console.log(`Winning Line: Start (${startX}, ${startY}), End (${endX}, ${endY}), Angle: ${angle}deg, Length: ${length}px`);
    }


    function showWinPopup() {
        if (winPopup) {
            winPopup.classList.add('show');
            winPopup.classList.remove('hide');
            const winMessage = document.getElementById('winMessage');
            if (winMessage) {
                winMessage.textContent = `${currentPlayer === 'x' ? player1Name : player2Name} Wins!`;
            }
        } else {
            console.error('winPopup element not found.');
        }

        showEndButtons();
    }


    function showEndButtons() {
        if (gameButtons) {
            gameButtons.style.display = 'flex';
        } else {
            console.error('gameButtons element not found.');
        }
    }

    
    function hideEndButtons() {
        if (gameButtons) {
            gameButtons.style.display = 'none';
        } else {
            console.error('gameButtons element not found.');
        }
    }


    function hideWinPopup() {
        if (winPopup) {
            winPopup.classList.add('hide');
            winPopup.classList.remove('show');
        } else {
            console.error('winPopup element not found.');
        }
    }


    function showGameHistory() {
        if (gameHistory) {
            gameHistory.style.display = 'block';
        } else {
            console.error('gameHistory element not found.');
        }
    }
   
    if (cells.length > 0) {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    } else {
        console.error('No cells found with [data-cell] attribute.');
    }


    if (mainRestartButton) {
        mainRestartButton.addEventListener('click', () => {
            startGame();
        });
    } else {
        console.error('Main restart button not found.');
    }

    if (popupRestartButton) {
        popupRestartButton.addEventListener('click', () => {
            startGame();
        });
    } else {
        console.error('Popup restart button not found.');
    }


    if (quitGameButtons.length > 0) {
        quitGameButtons.forEach(button => {
            button.addEventListener('click', () => {
                quitGame();
            });
        });
    } else {
        console.error('No Quit Game buttons found.');
    }

    function quitGame() {
        if (board) {
            board.style.display = 'none';
        } else {
            console.error('Board element not found.');
        }

        if (gameHistory) {
            gameHistory.style.display = 'none';
        } else {
            console.error('gameHistory element not found.');
        }

        hideWinPopup();

        hideEndButtons();

        if (playerNamesSection) {
            playerNamesSection.style.display = 'block';
        } else {
            console.error('playerNamesSection element not found.');
        }

        player1Name = 'Player X';
        player2Name = 'Player O';
        currentPlayer = 'x';
        isGameActive = false;

        if (statusText) {
            statusText.style.display = 'none';
            statusText.textContent = '';
        }

        cells.forEach(cell => {
            cell.classList.remove('x');
            cell.classList.remove('o');
            cell.removeAttribute('data-symbol');
        });

        if (winningLine) {
            winningLine.style.width = '0';
            winningLine.style.transform = 'rotate(0deg)';
            winningLine.style.top = '0';
            winningLine.style.left = '0';
        }

        if (gameTitle) {
            gameTitle.textContent = 'Welcome to Tic Tac Toe';
        }
    }


    function aiMove() {
        const availableCells = [...cells].filter(cell => !cell.classList.contains('x') && !cell.classList.contains('o'));
        if (availableCells.length === 0 || !isGameActive) return;

        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const cell = availableCells[randomIndex];


        isGameActive = false;

        setTimeout(() => { 
            cell.setAttribute('data-symbol', 'O');
            cell.classList.add('o');

 
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(error => {
                    console.error('Error playing clickSound:', error);
                });
            }


            if (checkWin()) {
                if (statusText) {
                    statusText.textContent = `${player2Name} Wins!`;
                }
                if (winSound) {
                    winSound.currentTime = 0;
                    winSound.play().catch(error => {
                        console.error('Error playing winSound:', error);
                    });
                }
                isGameActive = false;
                displayWinningLine();
                showWinPopup();
                triggerConfetti();
                updateGameHistory(player2Name);
                return;
            }

            if (isDraw()) {
                if (statusText) {
                    statusText.textContent = "It's a Draw!";
                }
                if (drawSound) {
                    drawSound.currentTime = 0;
                    drawSound.play().catch(error => {
                        console.error('Error playing drawSound:', error);
                    });
                }
                isGameActive = false;
                showEndButtons();
                updateGameHistory(null);
                return;
            }

       
            currentPlayer = 'x';
            updateStatusText();
            isGameActive = true;
        }, 500);
    }


    let gameHistoryList = [];
    function updateGameHistory(winner) {
        const historySection = gameHistory;
    
        if (historySection) {
            if (gameHistoryList.length === 0) {
                showGameHistory();
            }
    
            gameHistoryList.push(winner);
            
            const historyItem = document.createElement('p');
            historyItem.textContent = winner ? `${winner} won the game.` : "It's a draw.";
            historySection.appendChild(historyItem);
        } else {
            console.error('gameHistory element not found.');
        }
    }
    let gameHistoryData = [];

function updateGameHistory(winner) {
    const gameHistory = document.getElementById("gameHistory");
    

    let resultText;
    if (winner === "draw") {
        resultText = "It's a draw!";
    } else {
        resultText = `${winner} wins!`;
    }


    gameHistoryData.push(resultText);


    gameHistory.innerHTML = "<h2>Game History</h2>";

  
    gameHistoryData.forEach((gameResult, index) => {
        const p = document.createElement("p");
        p.textContent = `Game ${index + 1}: ${gameResult}`;
        gameHistory.appendChild(p);
    });

  
    if (gameHistoryData.length > 0) {
        gameHistory.style.display = "block";
    }
}

});
