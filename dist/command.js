//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { CanvasManager } from "./canvasmanager.js";
import { GameCanvas } from "./gamecanvas.js";
import { Controller } from "./controller.js";
import { GrassBlock, PathBlock } from "./pathclass.js";
import { PaintSelections } from "./paintselection.js";
import { DirectionTower, LinearRadiusTower, LinearTower, PathTower } from "./tower.js";
import { TowerDrawing } from "./towerDrawing.js";
import { onDisconnect, onValue, update, onChildAdded, onChildRemoved, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
class moveEnemyCommand {
    x;
    y;
    r;
    color;
    enemyPath;
    nextSquare;
    direction;
    moveSpd;
    currentSquareIndex;
    enemy;
    constructor(x, y, r, color, enemyPath, nextSquare, direction, moveSpd, currentSquareIndex, enemy) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.enemyPath = enemyPath;
        this.nextSquare = nextSquare;
        this.direction = direction;
        this.moveSpd = moveSpd;
        this.currentSquareIndex = currentSquareIndex;
        this.enemy = enemy;
    }
    execute() {
        if (this.nextSquare.centerX && this.nextSquare.centerY) {
            if (Math.abs(this.nextSquare.centerX - this.enemy.x) < this.enemy.moveSpd && Math.abs(this.nextSquare.centerY - this.enemy.y) < this.moveSpd) {
                if (this.enemyPath[this.currentSquareIndex + 1]) {
                    this.direction = this.enemyPath[this.currentSquareIndex + 1].direction;
                }
                if (this.enemyPath[this.currentSquareIndex + 2]) {
                    this.nextSquare = this.enemyPath[this.currentSquareIndex + 2];
                }
                this.currentSquareIndex++;
                this.enemy.increaseCurrentSquareIndex();
            }
            if (this.direction == "right") {
                this.enemy.increaseXPos(this.moveSpd);
            }
            if (this.direction == "down") {
                this.enemy.increaseYPos(this.moveSpd);
            }
            if (this.direction == "up") {
                this.enemy.decreaseYPos(this.moveSpd);
            }
            if (this.direction == "left") {
                this.enemy.decreaseXPos(this.moveSpd);
            }
            if (this.enemy.x + this.r <= 0 || this.enemy.x - this.r >= GameCanvas.WIDTH || this.enemy.y + this.r <= 0 || this.enemy.y - this.r >= GameCanvas.HEIGHT) {
                this.enemy.player.loseLife();
                this.enemy.inactivate();
            }
        }
    }
}
class TowerSelectionCommand {
    player;
    grassBlocks;
    pathBlocks;
    constructor(player, grassBlocks, pathBlocks) {
        this.player = player;
        this.grassBlocks = grassBlocks;
        this.pathBlocks = pathBlocks;
    }
    execute(x, y) {
        const newY = y - GameCanvas.HEIGHT;
        const box1 = this.inBox(x, newY, 30, 15, 50);
        const box2 = this.inBox(x, newY, 130, 15, 50);
        const box3 = this.inBox(x, newY, 230, 15, 50);
        const box4 = this.inBox(x, newY, 330, 15, 50);
        const box5 = this.inBox(x, newY, 430, 15, 50);
        new PaintSelections(this.player).drawSelections(box1, box2, box3, box4, box5);
        if (this.checkCollision(x, y) && (Controller.instance.overSelection === false)) {
            Controller.instance.toggleOverHover();
            document.body.style.cursor = "pointer";
        }
        else if ((Controller.instance.overSelection === true) && (this.checkCollision(x, y) === false)) {
            Controller.instance.toggleOverHover();
            document.body.style.cursor = "default";
        }
        if (box1) {
            Controller.instance.currentTower = 1;
        }
        else if (box2) {
            Controller.instance.currentTower = 2;
            if (!Controller.instance.overDirectionTower) {
                Controller.instance.toggleOverDirectionTower();
            }
        }
        else if (box3) {
            Controller.instance.currentTower = 3;
        }
        else if (box4) {
            Controller.instance.currentTower = 4;
        }
        else if (box5) {
            Controller.instance.currentTower = 5;
        }
        if (box1 || box3 || box4 || box5) {
            if (Controller.instance.overDirectionTower) {
                Controller.instance.toggleOverDirectionTower();
            }
        }
    }
    checkCollision(x, y) {
        const newY = y - GameCanvas.HEIGHT;
        return (this.inBox(x, newY, 30, 15, 50) && this.player.money >= LinearTower.cost) || (this.inBox(x, newY, 130, 15, 50) && this.player.money >= DirectionTower.cost) || (this.inBox(x, newY, 230, 15, 50) && this.player.money >= PathTower.cost) || (this.inBox(x, newY, 330, 15, 50) && this.player.money >= LinearRadiusTower.cost) || (this.inBox(x, newY, 430, 15, 50) && this.player.money >= 500);
    }
    inBox(mouseX, mouseY, x, y, w) {
        return mouseX >= x && mouseX <= (x + w) && mouseY >= y && mouseY <= (y + w);
    }
}
class towerMoveSelection {
    grassBlocks;
    pathBlocks;
    context;
    constructor(grassBlocks, pathBlocks) {
        this.grassBlocks = grassBlocks;
        this.pathBlocks = pathBlocks;
        this.context = CanvasManager.GameCanvas.mainContext;
    }
    execute(x, y) {
        if (x <= GameCanvas.WIDTH && y >= 0 && y <= GameCanvas.HEIGHT) {
            for (let j = 0; j < this.grassBlocks.length; j++) {
                if ((this.grassBlocks[j].centerX - 25 === (Math.floor(x / 50) * 50)) && (this.grassBlocks[j].centerY - 25 === (Math.floor(y / 50) * 50))) {
                    const context = CanvasManager.GameCanvas.mainContext;
                    if (Controller.instance.currentTower === 4) {
                        context.beginPath();
                        context.arc(this.grassBlocks[j].centerX, this.grassBlocks[j].centerY, 130, 0, 2 * Math.PI);
                        context.fillStyle = "rgba(255, 255, 255, 0.3)";
                        context.fill();
                    }
                    this.grassBlocks[j].toggleHovered();
                    this.grassBlocks[j].draw();
                    this.grassBlocks[j].toggleHovered();
                }
            }
            for (let j = 0; j < this.pathBlocks.length; j++) {
                if ((this.pathBlocks[j].centerX - 25 === (Math.floor(x / 50) * 50)) && (this.pathBlocks[j].centerY - 25 === (Math.floor(y / 50) * 50))) {
                    this.pathBlocks[j].toggleHovered();
                    this.pathBlocks[j].draw();
                    this.pathBlocks[j].toggleHovered();
                }
            }
            switch (Controller.instance.currentTower) {
                case 1:
                    TowerDrawing.drawCharacter1(this.context, x, y, 0.5);
                    break;
                case 2:
                    TowerDrawing.drawCharacter2(this.context, x, y, 0.5);
                    break;
                case 3:
                    TowerDrawing.drawCharacter3(this.context, x, y, 0.5);
                    break;
                case 4:
                    TowerDrawing.drawCharacter4(this.context, x, y, 0.5);
                    break;
                default:
                    throw new Error(`Invalid tower drawing.`);
            }
        }
    }
}
class PlantTower {
    towerManager;
    player;
    pathBlocks;
    grassBlocks;
    direction;
    constructor(towerManager, player, pathBlocks, grassBlocks, direction) {
        this.towerManager = towerManager;
        this.player = player;
        this.pathBlocks = pathBlocks;
        this.grassBlocks = grassBlocks;
        this.direction = direction;
    }
    execute(x, y) {
        const xSquare = Math.ceil(x / 50);
        const ySquare = Math.ceil(y / 50);
        if ((!this.isLocationOccupied(xSquare * 50, ySquare * 50, this.towerManager.towers))) {
            switch (Controller.instance.currentTower) {
                case 1:
                    if (this.onPath(xSquare * 50, ySquare * 50, this.grassBlocks, this.pathBlocks) instanceof GrassBlock) {
                        this.towerManager.createLinearTower(this.player, xSquare, ySquare);
                    }
                    break;
                case 2:
                    if (this.onPath(xSquare * 50, ySquare * 50, this.grassBlocks, this.pathBlocks) instanceof GrassBlock) {
                        this.towerManager.createDirectionTower(this.player, xSquare, ySquare, this.direction);
                    }
                    break;
                case 3:
                    if (this.onPath(xSquare * 50, ySquare * 50, this.grassBlocks, this.pathBlocks) instanceof PathBlock) {
                        this.towerManager.createPathTower(this.player, xSquare, ySquare);
                    }
                    break;
                case 4:
                    if (this.onPath(xSquare * 50, ySquare * 50, this.grassBlocks, this.pathBlocks) instanceof GrassBlock) {
                        this.towerManager.createLinearRadiusTower(this.player, xSquare, ySquare);
                    }
                    break;
                default:
                    throw new Error(`This is not a valid tower type.`);
            }
        }
    }
    onPath(x, y, grassBlocks, pathBlocks) {
        for (let j = 0; j < grassBlocks.length; j++) {
            if ((grassBlocks[j].centerX + 25 === x) && (grassBlocks[j].centerY + 25 === y)) {
                return grassBlocks[j];
            }
        }
        for (let j = 0; j < pathBlocks.length; j++) {
            if ((pathBlocks[j].centerX + 25 === x) && (pathBlocks[j].centerY + 25 === y)) {
                return pathBlocks[j];
            }
        }
    }
    //chat gpt
    isLocationOccupied(x, y, towers) {
        const towerWidth = 50;
        const towerHeight = 50;
        // Calculate the bounding box for the new tower
        const newTowerBoundingBox = {
            left: x - towerWidth,
            right: x,
            top: y - towerHeight,
            bottom: y
        };
        // Check for intersection with existing towers
        for (let tower of towers) {
            const existingTowerBoundingBox = {
                left: tower.x,
                right: tower.x + tower.w,
                top: tower.y,
                bottom: tower.y + tower.h
            };
            if (newTowerBoundingBox.left < existingTowerBoundingBox.right &&
                newTowerBoundingBox.right > existingTowerBoundingBox.left &&
                newTowerBoundingBox.top < existingTowerBoundingBox.bottom &&
                newTowerBoundingBox.bottom > existingTowerBoundingBox.top) {
                // Bounding boxes intersect, location is occupied
                return true;
            }
        }
        // No intersection found, location is not occupied
        return false;
    }
}
class StartMenuCommand {
    menu;
    startGameMenu = document.querySelector('#gameStart');
    startGameButton = document.querySelector('#gameStartButton');
    nickname = document.querySelector('.nickname');
    constructor(menu) {
        this.menu = menu;
    }
    execute() {
        this.startGameButton.addEventListener('click', e => {
            this.startGameMenu.hidden = true;
            console.log(this.nickname.value);
            const player = CanvasManager.instance.setPlayer(this.nickname.value);
            update(ref(FirebaseClient.instance.db, `/players/${player.id}`), {
                id: player.id,
                nickname: this.nickname.value
            });
            const gameRef = ref(FirebaseClient.instance.db, `/players/${player.id}`);
            onDisconnect(gameRef)
                .set(null)
                .then(() => {
                console.log(`onDisconnect set up for player ${player.id}`);
            })
                .catch((error) => {
                console.error(`Error setting up onDisconnect: ${error.message}`);
            });
            this.menu.items[0].executeCommand();
        });
    }
}
class HostOrJoinCommand {
    menu;
    // private startGameButton = document.querySelector('playAgainButton') as HTMLButtonElement;
    hostOrJoinMenu = document.querySelector('#hostOrJoinStart');
    hostButton = document.querySelector('#hostGameButton');
    joinButton = document.querySelector('#joinGameButton');
    constructor(menu) {
        this.menu = menu;
    }
    execute() {
        const disconnectMessage = document.querySelector('.disconnect-message');
        this.hostOrJoinMenu.hidden = false;
        this.hostButton.addEventListener('click', e => {
            disconnectMessage.hidden = true;
            this.hostOrJoinMenu.hidden = true;
            this.menu.items[0].executeCommand();
        });
        this.joinButton.addEventListener('click', e => {
            disconnectMessage.hidden = true;
            this.hostOrJoinMenu.hidden = true;
            this.menu.items[1].executeCommand();
        });
        // this.startGameButton.addEventListener('click', e => {
        //     this.menu.items[0].executeCommand();
        // })
    }
}
class HostMenuCommand {
    menu;
    hostStart = document.querySelector('#hostStart');
    randomCodeSpot = document.querySelector('.random-code');
    code;
    showButton = document.querySelector('.begin-game-loop');
    gameWrapper = document.querySelector('.game-wrapper');
    constructor(menu) {
        this.menu = menu;
        // Constructor setup if needed
    }
    execute() {
        this.hostStart.hidden = false;
        // const game = CanvasManager.instance.setGame();
        const connectionInstance = nanoid(5);
        CanvasManager.instance.setConnectionInstance(connectionInstance);
        onValue(ref(FirebaseClient.instance.db, `/players`), (snapshot) => {
            if (snapshot.val()) {
                const results = (Object.keys(snapshot.val()).map((key) => [key, snapshot.val()[key]]));
                console.log(results);
                for (let i = 0; i < results.length; i++) {
                    console.log(results[i]);
                    if (results[i][0] == CanvasManager.instance.player.id) {
                        update(ref(FirebaseClient.instance.db, `/games/${connectionInstance}/players/${results[i][0]}`), {
                            id: results[i][0],
                            host: true,
                            nickname: CanvasManager.instance.player.nickname
                        });
                    }
                }
                // console.log(results)
            }
            else {
                throw new Error("Database not configured properly.");
            }
        }, { onlyOnce: true });
        // Create a new game instance
        this.randomCodeSpot.innerHTML = `<i>${connectionInstance}`;
        // Create a new player instance
        // const player = new Player(10);
        // Set up onDisconnect for this specific game
        const gameRef = ref(FirebaseClient.instance.db, `/games/${connectionInstance}`);
        update(ref(FirebaseClient.instance.db, `/games/${connectionInstance}`), {
            id: connectionInstance,
            stage: "game setup"
        });
        onDisconnect(gameRef)
            .set(null)
            .then(() => {
            console.log(`onDisconnect set up for game ${connectionInstance}`);
        })
            .catch((error) => {
            console.error(`Error setting up onDisconnect: ${error.message}`);
        });
        // Perform any other operations related to game setup or player initialization
        // update(ref(FirebaseClient.instance.db, `/games/${game.id}/players/${player.id}`), {
        //     host: true,
        //     id: player.id
        // });
        // Set up a listener to detect when another player joins
        const playersRef = ref(FirebaseClient.instance.db, `/games/${connectionInstance}/players`);
        onChildAdded(playersRef, (snapshot) => {
            const newPlayer = snapshot.val();
            console.log(newPlayer);
            console.log(`New player joined: ${newPlayer.id}`);
            // Handle the new player joining
            this.handlePlayerJoin(newPlayer);
        });
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete(snapshot.val());
        });
    }
    handlePlayerJoin(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            const playerJoined = document.querySelector('.player-joined');
            CanvasManager.instance.opponentId = player.id;
            playerJoined.innerHTML = (`${player.nickname} has joined the game.`);
            this.showButton.hidden = false;
            CanvasManager.instance.setOpponent(player.nickname);
            this.showButton.addEventListener('click', e => {
                this.hostStart.hidden = true;
                update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), {
                    stage: "map selection"
                });
                this.menu.items[0].executeCommand();
            });
        }
        // Update the game state, UI, etc.
    }
    handlePlayerDelete(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            const playerJoined = document.querySelector('.player-joined');
            this.gameWrapper.hidden = true;
            playerJoined.innerHTML = (`${player.nickname} has left the game.`);
            this.showButton.hidden = true;
        }
        // Update the game state, UI, etc.
    }
}
class JoinMenuCommand {
    menu;
    joinStart = document.querySelector('#joinStart');
    submitCodeButton = document.querySelector('#codeButton');
    codeInputValue = document.querySelector('.code-input');
    errorMessage = document.querySelector('.error-message');
    results = [];
    // private joinButton = document.querySelector('#joinButton') as HTMLButtonElement;
    constructor(menu) {
        this.menu = menu;
        // onDisconnect(
        //     set(ref(FirebaseClient.instance.db, "/games"), "")
        // );
    }
    execute() {
        this.joinStart.hidden = false;
        this.submitCodeButton.addEventListener('click', e => {
            // const gameRef = (FirebaseClient.instance.db, `/games/${this.codeInputValue.id}`);
            // console.log(gameRef)
            onValue(ref(FirebaseClient.instance.db, `/games/${this.codeInputValue.value}`), (snapshot) => {
                if (snapshot.val()) {
                    if (Object.keys(snapshot.val().players).length === 2) {
                        this.errorMessage.innerHTML = `This game is full!`;
                    }
                    else {
                        this.errorMessage.innerHTML = ``;
                        onValue(ref(FirebaseClient.instance.db, `/players`), (snapshot) => {
                            if (snapshot.val()) {
                                const results = (Object.keys(snapshot.val()).map((key) => [key, snapshot.val()[key]]));
                                console.log(results);
                                for (let i = 0; i < results.length; i++) {
                                    console.log(results[i]);
                                    if (results[i][0] == CanvasManager.instance.player.id) {
                                        CanvasManager.instance.setConnectionInstance(this.codeInputValue.value);
                                        update(ref(FirebaseClient.instance.db, `/games/${this.codeInputValue.value}/players/${results[i][0]}`), {
                                            id: results[i][0],
                                            host: false,
                                            nickname: CanvasManager.instance.player.nickname
                                        });
                                    }
                                }
                                this.joinStart.hidden = true;
                                this.menu.items[0].executeCommand();
                            }
                            else {
                                throw new Error("Database not configured properly.");
                            }
                        }, { onlyOnce: true });
                        const gameRef = ref(FirebaseClient.instance.db, `/games/${this.codeInputValue.value}/players/${CanvasManager.instance.player.id}`);
                        onDisconnect(gameRef)
                            .set(null)
                            .then(() => {
                            console.log(`onDisconnect set up for player ${CanvasManager.instance.player.id}`);
                        })
                            .catch((error) => {
                            console.error(`Error setting up onDisconnect: ${error.message}`);
                        });
                        // update(ref(FirebaseClient.instance.db, `/games/${this.codeInputValue.value}/players/${player.id}`), {
                        //     id: player.id,
                        //     host: false
                        // });
                    }
                }
                else {
                    this.errorMessage.innerHTML = `That is not a valid game ID. Please try again.`;
                }
            }, { onlyOnce: true });
        });
    }
}
class JoinHostRoomCommand {
    menu;
    guestWaitingStart = document.querySelector('#guestWaitingStart');
    waitingText = document.querySelector('.waiting-text');
    stage;
    constructor(menu) {
        this.menu = menu;
    }
    handlePlayerJoin(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            CanvasManager.instance.opponentId = player.id;
            // const playerJoined = document.querySelector('.player-joined') as HTMLHeadingElement;
            this.stage = CanvasManager.instance.setStage("game setup");
            // playerJoined.innerHTML = (`${player.nickname} has joined the game.`);
            CanvasManager.instance.setOpponent(player.nickname);
            this.waitingText.innerHTML = `Waiting for ${player.nickname} to start the game.`;
        }
        // Update the game state, UI, etc.
    }
    handlePlayerDelete(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            this.guestWaitingStart.hidden = true;
            const disconnectMessage = document.querySelector('.disconnect-message');
            disconnectMessage.hidden = false;
            this.menu.items[2].executeCommand();
        }
        // Update the game state, UI, etc.
    }
    execute() {
        this.guestWaitingStart.hidden = false;
        // console.log(CanvasManager.instance.connectionInstance)
        onValue(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`), (snapshot) => {
            if (snapshot.val()) {
                const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
                onChildAdded(playersRef, (snapshot) => {
                    const newPlayer = snapshot.val();
                    console.log(newPlayer);
                    console.log(`New player joined: ${newPlayer.id}`);
                    // Handle the new player joining
                    this.handlePlayerJoin(newPlayer);
                });
                onChildRemoved(playersRef, (snapshot) => {
                    this.handlePlayerDelete(snapshot.val());
                });
            }
            else {
                throw new Error("Database not configured properly.");
            }
        }, { onlyOnce: true });
        onValue(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), (snapshot) => {
            if (snapshot.exists()) {
                const gameData = snapshot.val();
                const currentStageValue = gameData.stage;
                // console.log(gameData)
                // console.log(currentStageValue)
                // console.log(CanvasManager.instance.stage)
                // Check if the stage property has changed
                if (currentStageValue !== CanvasManager.instance.stage) {
                    console.log(`Stage changed to: ${currentStageValue}`);
                    this.waitingText.innerHTML = `Waiting for ${CanvasManager.instance.opponent.nickname} to select a map.`;
                    CanvasManager.instance.setStage(currentStageValue);
                    if (currentStageValue === "game loop") {
                        this.guestWaitingStart.hidden = true;
                        if (gameData.mapSelection === 1) {
                            this.menu.items[0].executeCommand();
                        }
                        else if (gameData.mapSelection === 2) {
                            this.menu.items[1].executeCommand();
                        }
                    }
                }
            }
            else {
                throw new Error("Database not configured properly.");
            }
        }, { onlyOnce: false } // Listen for ongoing changes
        );
    }
}
class PlayAgainCommand {
    constructor() { }
    playAgain = document.querySelector('#playAgain');
    execute() {
        this.playAgain.hidden = false;
    }
}
class LevelSelectionCommand {
    menu;
    levelSelection = document.getElementById('levelSelect');
    constructor(menu) {
        this.menu = menu;
    }
    execute() {
        this.levelSelection.hidden = false;
        const buttonHolder1 = document.querySelector('.button-1-place');
        const buttonHolder2 = document.querySelector('.button-2-place');
        buttonHolder1.innerHTML = `<button class="level-btn" value="1">Map 1</button>`;
        buttonHolder2.innerHTML = `<button class="level-btn" value="2">Map 2</button>`;
        const mapBtns = document.querySelectorAll('.level-btn');
        if (mapBtns.length > 0) {
            mapBtns.forEach((button, index) => {
                const currentButton = button;
                const handleClick = (e) => {
                    this.levelSelection.hidden = true;
                    this.menu.items[parseInt(currentButton.value) - 1].executeCommand();
                };
                currentButton.removeEventListener('click', handleClick);
                currentButton.addEventListener('click', handleClick);
            });
        }
        else {
            throw new Error('Map button not found');
        }
        const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete(snapshot.val());
        });
    }
    handlePlayerDelete(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            const guestDisconnect = document.querySelector('.player-joined');
            guestDisconnect.innerHTML = (`${player.nickname} has left the game.`);
            this.levelSelection.hidden = true;
            this.menu.items[2].executeCommand();
        }
        // Update the game state, UI, etc.
    }
}
class BeginGameCommand {
    mapNumber;
    playAgain = document.querySelector('#playAgain');
    gameWrapper = document.querySelector('.game-wrapper');
    constructor(mapNumber) {
        this.mapNumber = mapNumber;
    }
    handlePlayerDelete(player) {
        // Logic to handle a new player joining
        if (player.id !== CanvasManager.instance.player.id) {
            // this.playAgain.hidden = false;
            const gameRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`);
            onDisconnect(gameRef)
                .set(null)
                .then(() => {
                console.log(`onDisconnect set up for game ${CanvasManager.instance.connectionInstance}`);
            })
                .catch((error) => {
                console.error(`Error setting up onDisconnect: ${error.message}`);
            });
            CanvasManager.instance.endGame();
            this.gameWrapper.hidden = true;
        }
        // Update the game state, UI, etc.
    }
    execute() {
        update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), {
            mapSelection: this.mapNumber,
            stage: "game loop"
        });
        console.log('game loop ig');
        const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete(snapshot.val());
        });
        CanvasManager.instance.setStage("game loop");
        CanvasManager.instance.setGame(this.mapNumber);
        CanvasManager.instance.setOpponentGame(this.mapNumber);
        CanvasManager.instance.setupGame();
        // CanvasManager.instance.setupGame();
        // CanvasManager.instance.game.mainLoop();
    }
}
export { StartMenuCommand, HostOrJoinCommand, HostMenuCommand, JoinMenuCommand, PlantTower, towerMoveSelection, TowerSelectionCommand, moveEnemyCommand, JoinHostRoomCommand, LevelSelectionCommand, BeginGameCommand };
//# sourceMappingURL=command.js.map