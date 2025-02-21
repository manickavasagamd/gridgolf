const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const historyList = document.getElementById("historyList");
        const scoreList = document.getElementById("scoreList");
        const currentScoreDisplay = document.getElementById("currentScore");
        const controls = document.getElementById("controls");
        const powerBar = document.getElementById("powerBar");
        const powerLevel = document.getElementById("powerLevel");
        const outcomeDisplay = document.getElementById("outcomeDisplay");
        const newGameButton = document.getElementById("newGameButton");
        const gameOverDisplay = document.getElementById("gameOverDisplay");
        const historySection = document.querySelector('.history');
        const scoreboardSection = document.querySelector('.scoreboard');
        const scoreTableDiv = document.getElementById('scoreTable'); // Score table container
		const holeNumberDisplay = document.getElementById("holeNumberDisplay"); // Get the hole number span
		const holeParDisplay = document.getElementById("holeParDisplay");     // Get the hole par span
        const howToPlayButton = document.getElementById('howToPlayBtn'); // Get How to Play button
        const howToPlayGuide = document.getElementById('howToPlayGuide'); // Get guide div

        const gridSize = 12;
        const cellSize = 20;
        let ball = { x: 40, y: 40, radius: 6, velocityX: 0, velocityY: 0, speed: 0 };
        let holes = [];
        let currentHole = 0;
        let obstacles = [];
        let swingCount = 0;
        let scores = [];
        const friction = 0.8;
        let ballMoving = false;
        let currentDirection = "None";
        let currentPower = 0;
        let gameHistory = [];

        function generateHoles() {
            holes = [];
            holes.push({
                x: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                y: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                radius: 8, par: 4
            });
            holes.push({
                x: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                y: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                radius: 8, par: 3
            });
            holes.push({
                x: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                y: Math.floor(Math.random() * gridSize) * cellSize + cellSize / 2,
                radius: 8, par: 5
            });
        }


       function generateObstacles() {
    obstacles = [];
    const holePositions = holes.map(hole => ({ // Get positions of all holes
        x: Math.floor(hole.x / cellSize) * cellSize,
        y: Math.floor(hole.y / cellSize) * cellSize
    }));

    for (let i = 0; i < 7; i++) {
        let obstaclePosition;
        let overlap;
        do {
            overlap = false;
            obstaclePosition = {
                x: Math.floor(Math.random() * gridSize) * cellSize,
                y: Math.floor(Math.random() * gridSize) * cellSize
            };
            for (let holePos of holePositions) { // Check for overlap with each hole
                if (obstaclePosition.x === holePos.x && obstaclePosition.y === holePos.y) {
                    overlap = true;
                    break;
                }
            }
        } while (overlap); // Keep generating until no overlap with holes

        obstacles.push({ ...obstaclePosition, type: "rock" });
    }
    for (let i = 0; i < 3; i++) {
        let obstaclePosition;
        let overlap;
        do {
            overlap = false;
            obstaclePosition = {
                x: Math.floor(Math.random() * gridSize) * cellSize,
                y: Math.floor(Math.random() * gridSize) * cellSize
            };
            for (let holePos of holePositions) { // Check for overlap with each hole
                if (obstaclePosition.x === holePos.x && obstaclePosition.y === holePos.y) {
                    overlap = true;
                    break;
                }
            }
        } while (overlap); // Keep generating until no overlap with holes
        obstacles.push({ ...obstaclePosition, type: "bush" });
    }
    for (let i = 0; i < 2; i++) {
        let obstaclePosition;
        let overlap;
        do {
            overlap = false;
            obstaclePosition = {
                x: Math.floor(Math.random() * (gridSize - 1)) * cellSize,
                y: Math.floor(Math.random() * (gridSize - 1)) * cellSize
            };
            for (let holePos of holePositions) { // Check for overlap with each hole
                if (obstaclePosition.x === holePos.x && obstaclePosition.y === holePos.y) {
                    overlap = true;
                    break;
                }
            }
        } while (overlap); // Keep generating until no overlap with holes
        obstacles.push({ ...obstaclePosition, type: "sand" });
    }
}

        function drawObstacles() {
            obstacles.forEach(obstacle => {
                if (obstacle.type === "rock") {
                    ctx.fillStyle = "#7f8c8d";
                } else if (obstacle.type === "bush") {
                    ctx.fillStyle = "#2ecc71";
                } else if (obstacle.type === "sand") {
                    ctx.fillStyle = "#f4e04d";
                }
                ctx.fillRect(obstacle.x, obstacle.y, cellSize, cellSize);
            });
        }

        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "#ccc";
            for (let i = 0; i < canvas.width; i += cellSize) {
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
            }
            ctx.stroke();
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#3498db";
            ctx.fill();
            ctx.closePath();
        }

        function drawHole() {
            let hole = holes[currentHole];
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#2c3e50";
            ctx.fill();
            ctx.closePath();
        }

        function gameLoop() {
            drawGrid();
            drawHole();
            drawObstacles();
            drawBall();

            requestAnimationFrame(gameLoop);
        }

        function resetGame() {
            currentHole = 0;
            swingCount = 0;
            scores = [];
            gameHistory = [];
            ball.x = 40;
            ball.y = 40;
            ballMoving = false;
            generateHoles();
            generateObstacles();
            gameLoop();
            updateScoreboard();
            historyList.innerHTML = '';
            gameOverDisplay.style.display = 'none';
            // Ensure sections are not collapsed on new game
            expandSection('historyContent');
            expandSection('scoreContent');
			updateHoleDisplay();
        }

        function toggleSection(sectionId) {
            const sectionContent = document.getElementById(sectionId);
            sectionContent.classList.toggle('collapsed-content');
        }

        function expandSection(sectionId) {
            const sectionContent = document.getElementById(sectionId);
            sectionContent.classList.remove('collapsed-content');
        }
        function toggleHowToPlay() {
            howToPlayGuide.style.display = howToPlayGuide.style.display === 'none' ? 'block' : 'none';
        }
        window.addEventListener('load', setCanvasSize);
        window.addEventListener('resize', setCanvasSize);
        generateHoles();
        generateObstacles();
        gameLoop();
        updateScoreboard();
	updateHoleDisplay();

        // Initially collapse history and scoreboard content
        toggleSection('historyContent');
        //toggleSection('scoreContent');


        // Direction Buttons Event Listeners
        document.getElementById("N").addEventListener("click", function() { setDirection(0, -1, "N"); });
        document.getElementById("NE").addEventListener("click", function() { setDirection(1, -1, "NE"); });
        document.getElementById("E").addEventListener("click", function() { setDirection(1, 0, "E"); });
        document.getElementById("SE").addEventListener("click", function() { setDirection(1, 1, "SE"); });
        document.getElementById("S").addEventListener("click", function() { setDirection(0, 1, "S"); });
        document.getElementById("SW").addEventListener("click", function() { setDirection(-1, 1, "SW"); });
        document.getElementById("W").addEventListener("click", function() { setDirection(-1, 0, "W"); });
        document.getElementById("NW").addEventListener("click", function() { setDirection(-1, -1, "NW"); });

        // New Game Button Event Listener
        newGameButton.addEventListener("click", resetGame);
        howToPlayBtn.addEventListener('click', toggleHowToPlay);
		
        function getRandomPower() {
            return Math.floor(Math.random() * 6) + 1;
        }

        function checkObstacleCollision(x, y) {
            for (let obstacle of obstacles) {
                if (x >= obstacle.x && x < obstacle.x + cellSize &&
                    y >= obstacle.y && y < obstacle.y + cellSize) {
                    return true;
                }
            }
            return false;
        }

        function checkHoleCollision() {
            let hole = holes[currentHole];
            const ballGridX = Math.floor(ball.x / cellSize);
            const ballGridY = Math.floor(ball.y / cellSize);
            const holeGridX = Math.floor(hole.x / cellSize);
            const holeGridY = Math.floor(hole.y / cellSize);
            return ballGridX === holeGridX && ballGridY === holeGridY;
        }

        function getScoreTerm(strokes, par) {
			console.log(strokes,"par",par);
            let score = strokes - par;
            if (score === -3) return "Albatross";
            if (score === -2) return "Eagle";
            if (score === -1) return "Birdie";
            if (score === 0) return "Par";
            if (score === 1) return "Bogey";
            if (score === 2) return "Double Bogey";
            if (score === 3) return "Triple Bogey";
            return "Bad Putter";
        }

        function updateScoreboard() {
            let tableHTML = '<table id="scoreTable"><thead><tr><th>Hole</th><th>Par</th><th>Score</th><th>Result</th></tr></thead><tbody>';
            let totalScore = 0;
            for (let i = 0; i < scores.length; i++) {
                const scoreTerm = getScoreTerm(scores[i], holes[i].par);
                tableHTML += `<tr><td>${i + 1}</td><td>${holes[i].par}</td><td>${scores[i]}</td><td>${scoreTerm}</td></tr>`;
                totalScore += scores[i];
            }
            tableHTML += `</tbody><tfoot><tr><td colspan="2">Total</td><td>${totalScore}</td><td></td></tr></tfoot></table>`;
            scoreTableDiv.innerHTML = tableHTML; // Set table HTML to the scoreTable div
        }


        function updateHistory(direction, power, outcome) {
            const historyItem = document.createElement('li');
            historyItem.textContent = `Swing ${swingCount}: ${direction}, Power ${power}, ${outcome}`;
            historyList.appendChild(historyItem);
            historyList.scrollTop = historyList.scrollHeight;
        }


        function moveToNextHole() {
            currentHole++;
            swingCount = 0;
            if (currentHole < holes.length) {
                ball.x = 40;
                ball.y = 40;
                generateObstacles();
            } else {
                ballMoving = false;
                gameOverDisplay.style.display = 'block';
            }
			updateHoleDisplay(); // Call function to update display
        }


        function moveBallToGridPosition(targetX, targetY) {
            let steps = 10;
            let currentStep = 0;
            let startX = ball.x;
            let startY = ball.y;
            let stepX = (targetX - startX) / steps;
            let stepY = (targetY - startY) / steps;

            let intervalId = setInterval(function() {
                let nextX = ball.x + stepX;
                let nextY = ball.y + stepY;

                const hole = holes[currentHole];
                const holeGridX = Math.floor(hole.x / cellSize);
                const holeGridY = Math.floor(hole.y / cellSize);
                const nextBallGridX = Math.floor(nextX / cellSize);
                const nextBallGridY = Math.floor(nextY / cellSize);


                // Check if ball is entering hole cell
                if (nextBallGridX === holeGridX && nextBallGridY === holeGridY) {
                    clearInterval(intervalId);
                    ball.x = hole.x;
                    ball.y = hole.y;
                    ballMoving = false;

                    scores.push(swingCount);
                    updateScoreboard();
                    let scoreTerm = getScoreTerm(swingCount, holes[currentHole].par);
                    gameHistory.push({swing: swingCount, direction: currentDirection, power: currentPower, outcome: scoreTerm});
                    updateHistory(currentDirection, currentPower, scoreTerm);
                    if (currentHole < holes.length - 1) {
                        moveToNextHole();
                    } else {
                        moveToNextHole();
                    }
                    return;
                }


                //Boundary Check
                if (nextX - ball.radius < 0 || nextX + ball.radius > canvas.width ||
                    nextY - ball.radius < 0 || nextY + ball.radius > canvas.height) {
                    clearInterval(intervalId);
                    ball.velocityX = 0;
                    ball.velocityY = 0;
                    ballMoving = false;
                    gameHistory.push({swing: swingCount, direction: currentDirection, power: currentPower, outcome: "Boundary Hit"});
                    updateHistory(currentDirection, currentPower, "Boundary Hit");
                    return;
                }

                // Obstacle Collision Check
                if (checkObstacleCollision(nextX - ball.radius, nextY - ball.radius) ||
                    checkObstacleCollision(nextX + ball.radius, nextY - ball.radius) ||
                    checkObstacleCollision(nextX - ball.radius, nextY + ball.radius) ||
                    checkObstacleCollision(nextX + ball.radius, nextY + ball.radius) ||
                    checkObstacleCollision(nextX, nextY))
                     {
                    clearInterval(intervalId);
                    ball.velocityX = 0;
                    ball.velocityY = 0;
                    ballMoving = false;
                    gameHistory.push({swing: swingCount, direction: currentDirection, power: currentPower, outcome: "Obstacle Hit"});
                    updateHistory(currentDirection, currentPower, "Obstacle Hit");
                    return;
                }


                ball.x = nextX;
                ball.y = nextY;
                currentStep++;

                if (currentStep >= steps) {
                    clearInterval(intervalId);
                    ball.x = Math.round(targetX / cellSize) * cellSize;
                    ball.y = Math.round(targetY / cellSize) * cellSize;
                    ballMoving = false;


                    if (!checkHoleCollision()) {
                        gameHistory.push({swing: swingCount, direction: currentDirection, power: currentPower, outcome: "Missed Hole"});
                        updateHistory(currentDirection, currentPower, "Missed Hole");
                    }

                }
            }, 30);
        }


        function setDirection(xDir, yDir, directionName) {
            if (!ballMoving && currentHole < holes.length) {
                swingCount++;
                let power = getRandomPower();
                powerLevel.style.height = `${(power / 6) * 100}%`;
                let targetX = ball.x + xDir * cellSize * power;
                let targetY = ball.y + yDir * cellSize * power;
                ballMoving = true;
                moveBallToGridPosition(targetX, targetY);

                currentDirection = directionName;
                currentPower = power;
                outcomeDisplay.textContent = `Direction: ${currentDirection}, Power: ${currentPower}`;
            }
        }
		
		function updateHoleDisplay() { // NEW FUNCTION to update the hole display
			holeNumberDisplay.textContent = `Hole: ${currentHole + 1}`;
			holeParDisplay.textContent = `Par: ${holes[currentHole].par}`;
        }

function setCanvasSize() {
    // 1. Get the computed width from CSS:
    const computedStyle = window.getComputedStyle(canvas);
    const canvasWidthCSS = computedStyle.width;

    // Convert CSS width (like "90vw" or "300px") to a number (pixels):
    const canvasPixelWidth = parseFloat(canvasWidthCSS);

    // 2. Set canvas width and height in JavaScript to the computed width:
    canvas.width = canvasPixelWidth;
    canvas.height = canvasPixelWidth; // Keep it square

    // **Important:** After resizing the canvas, you might need to redraw the game!
   resetGame();
}


(function() {
  let gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-1BVNE4G40G";
  document.head.appendChild(gtagScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', 'G-1BVNE4G40G');
})();
