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
    /**
     * On execution, the start menu will display
     * When the button is clicked:
     * The player will be created based on the entered nickname
     * The player will be added to a database, accessible by it's unique id
     * When the player leaves, they will be removed from the database
     * The menu item command will be executed
     */
    execute() {
        this.startGameButton.addEventListener('click', e => {
            this.startGameMenu.hidden = true;
            const player = CanvasManager.instance.setPlayer(this.nickname.value);
            update(ref(FirebaseClient.instance.db, `/players/${player.id}`), {
                id: player.id,
                nickname: this.nickname.value
            });
            const gameRef = ref(FirebaseClient.instance.db, `/players/${player.id}`);
            onDisconnect(gameRef)
                .set(null)
                .then(() => { })
                .catch((error) => { });
            this.menu.items[0].executeCommand();
        });
    }
}
class HostOrJoinCommand {
    menu;
    hostOrJoinMenu = document.querySelector('#hostOrJoinStart');
    hostButton = document.querySelector('#hostGameButton');
    joinButton = document.querySelector('#joinGameButton');
    constructor(menu) {
        this.menu = menu;
    }
    /**
     * On execution, the menu wll be displayed
     * If the host button is clicked, the first menu item will be executed
     * If the join button is clicked, the second menu item will be executed
     */
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
    }
}
class HostMenuCommand {
    menu;
    hostStart = document.querySelector('#hostStart');
    randomCodeSpot = document.querySelector('.random-code');
    showButton = document.querySelector('.begin-game-loop');
    gameWrapper = document.querySelector('.game-wrapper');
    constructor(menu) {
        this.menu = menu;
    }
    /**
     * On execution, the menu for the host will be displayed
     * A random 5 digit id will be generated and have the database based on it
     * The host detects when the guest has joined the game, and adds that player to the newly creates game branch
     * The randomly generated code is displayed for the host to share
     * The game stage is changed to game setup, for the guest to read on the database
     * Disconenct is set up to delete the game branch when the host leaves
     * Players joining/leaving are handled using onChildAdded/removed
     */
    execute() {
        this.hostStart.hidden = false;
        const connectionInstance = nanoid(5);
        CanvasManager.instance.setConnectionInstance(connectionInstance);
        onValue(ref(FirebaseClient.instance.db, `/players`), (snapshot) => {
            if (snapshot.val()) {
                const results = (Object.keys(snapshot.val()).map((key) => [key, snapshot.val()[key]]));
                for (let i = 0; i < results.length; i++) {
                    if (results[i][0] == CanvasManager.instance.player.id) {
                        update(ref(FirebaseClient.instance.db, `/games/${connectionInstance}/players/${results[i][0]}`), {
                            id: results[i][0],
                            host: true,
                            nickname: CanvasManager.instance.player.nickname
                        });
                    }
                }
            }
        }, { onlyOnce: true });
        this.randomCodeSpot.innerHTML = `<i>${connectionInstance}`;
        const gameRef = ref(FirebaseClient.instance.db, `/games/${connectionInstance}`);
        update(ref(FirebaseClient.instance.db, `/games/${connectionInstance}`), {
            id: connectionInstance,
            stage: "game setup"
        });
        onDisconnect(gameRef)
            .set(null)
            .then(() => { })
            .catch((error) => {
            throw new Error(`Error setting up onDisconnect: ${error.message}`);
        });
        const playersRef = ref(FirebaseClient.instance.db, `/games/${connectionInstance}/players`);
        onChildAdded(playersRef, (snapshot) => {
            const newPlayer = snapshot.val();
            this.handlePlayerJoin(newPlayer);
        });
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete(snapshot.val());
        });
    }
    /**
     * @param player - the player joining the game
     * Assuming the player joined is not the same player that's hosting the game:
     * The host is able to see the nickname of the guest joining the game
     * The CanvasManager sets the opponent according to their nickname
     * The host now has the option to start the game
     * Once the button to start the game is clicked, the menu is hidden and the first menu item is executed
     */
    handlePlayerJoin(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            const playerJoined = document.querySelector('.player-joined');
            CanvasManager.instance.opponentId = player.id;
            playerJoined.innerHTML = (`${player.nickname} has joined the game.`);
            CanvasManager.instance.setOpponent(player.nickname);
            this.showButton.hidden = false;
            this.showButton.addEventListener('click', e => {
                this.hostStart.hidden = true;
                this.menu.items[0].executeCommand();
            });
        }
    }
    /**
     * @param player - the player leavinig the game
     * Assuming the player leaving is not the player who's hosting:
     * The host gets the message that the player left the game
     * The button to start the game is hidden
     */
    handlePlayerDelete(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            const playerJoined = document.querySelector('.player-joined');
            this.gameWrapper.hidden = true;
            playerJoined.innerHTML = (`${player.nickname} has left the game.`);
            this.showButton.hidden = true;
        }
    }
}
class JoinMenuCommand {
    menu;
    joinStart = document.querySelector('#joinStart');
    submitCodeButton = document.querySelector('#codeButton');
    codeInputValue = document.querySelector('.code-input');
    errorMessage = document.querySelector('.error-message');
    constructor(menu) {
        this.menu = menu;
    }
    /**
     * Upon execution, the menu will be displayed
     * Once the button to submit the game code is pressed, the database is searched to see if the ID was valid
     * If the ID was valid, but the game is full, the user can't join
     * If the ID is valid otherwise, the player joins the game and their information is transferred into the database
     * Once they are transferred in, the first menu item is executed
     * If they disconnect from the game, this newly created instance of the player in the game branch will be deleted
     * If the ID is not valid, the user will get an error message
     */
    execute() {
        this.joinStart.hidden = false;
        this.submitCodeButton.addEventListener('click', e => {
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
                                for (let i = 0; i < results.length; i++) {
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
                        }, { onlyOnce: true });
                        const gameRef = ref(FirebaseClient.instance.db, `/games/${this.codeInputValue.value}/players/${CanvasManager.instance.player.id}`);
                        onDisconnect(gameRef)
                            .set(null)
                            .then(() => { })
                            .catch((error) => { });
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
    constructor(menu) {
        this.menu = menu;
    }
    /**
     * @param player - the other player in the game (the host)
     * Assuming the player is not the same as the user's player:
     * The opponent ID is set the opponent's ID
     * The game state is changed to game setup (not in the database)
     */
    handlePlayerJoin(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            CanvasManager.instance.opponentId = player.id;
            CanvasManager.instance.setStage("game setup");
            CanvasManager.instance.setOpponent(player.nickname);
            this.waitingText.innerHTML = `Waiting for ${player.nickname} to start the game.`;
        }
    }
    /**
     * @param player - the host
     * When the host disconnects, the guest will receive a message saying they disconnectd
     * The third menu item's command will be executed (redirect to host/join menu)
     */
    handlePlayerDelete(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            this.guestWaitingStart.hidden = true;
            const disconnectMessage = document.querySelector('.disconnect-message');
            disconnectMessage.hidden = false;
            this.menu.items[2].executeCommand();
        }
    }
    /**
     * Upon execution, the waiting menu will be displayed
     * Player's joining/leaving will be handled with the handlePlayerJoin and handlePlayerDelete methods respectively
     * When the game stage is being updated, the displayed message will be too accordingly
     * When the game stage is in "game loop", a menu item will be executed, depending on the map selection stored in the database
     */
    execute() {
        this.guestWaitingStart.hidden = false;
        onValue(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`), (snapshot) => {
            if (snapshot.val()) {
                const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
                onChildAdded(playersRef, (snapshot) => {
                    const newPlayer = snapshot.val();
                    this.handlePlayerJoin(newPlayer);
                });
                onChildRemoved(playersRef, (snapshot) => {
                    this.handlePlayerDelete(snapshot.val());
                });
            }
        }, { onlyOnce: true });
        onValue(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), (snapshot) => {
            if (snapshot.exists()) {
                const gameData = snapshot.val();
                const currentStageValue = gameData.stage;
                if (currentStageValue !== CanvasManager.instance.stage) {
                    const playAgainScreen = document.querySelector('#playAgain');
                    playAgainScreen.hidden = true;
                    this.guestWaitingStart.hidden = false;
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
        }, { onlyOnce: false } // Listen for ongoing changes
        );
    }
}
class LevelSelectionCommand {
    menu;
    levelSelection = document.getElementById('levelSelect');
    constructor(menu) {
        this.menu = menu;
    }
    /**
     * Upon execution, the menu will be displayed and the stage will be set to map selection
     * Depending on which button is pressed, a menu item will execute to start the game
     * If a player disconnects, the handlePlayerDelete method is called
     */
    execute() {
        this.levelSelection.hidden = false;
        update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), {
            stage: "map selection"
        });
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
    /**
     *
     * @param player - the player being disconnected
     * The map selection menu is hidden and the host is redirected to the 'waiting room'
     */
    handlePlayerDelete(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            const guestDisconnect = document.querySelector('.player-joined');
            guestDisconnect.innerHTML = (`${player.nickname} has left the game.`);
            this.levelSelection.hidden = true;
            this.menu.items[2].executeCommand();
        }
    }
}
class BeginGameCommand {
    mapNumber;
    playAgain = document.querySelector('#playAgain');
    gameWrapper = document.querySelector('.game-wrapper');
    constructor(mapNumber) {
        this.mapNumber = mapNumber;
    }
    /**
     *
     * @param player - the player that disconnects
     * When the player disconnects, the instance of the game is destroyed
     */
    handlePlayerDelete(player) {
        if (player.id !== CanvasManager.instance.player.id) {
            const gameRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`);
            onDisconnect(gameRef)
                .set(null)
                .then(() => { })
                .catch((error) => {
                throw new Error(`Error setting up onDisconnect: ${error.message}`);
            });
            CanvasManager.instance.endGame();
            this.gameWrapper.hidden = true;
            this.playAgain.hidden = true;
        }
    }
    /**
     * Upon execution, the game state is set to game loop
     * The map selection is pasted in the database for the guest to interpret
     * The game is setup in the canvas manager
     */
    execute() {
        update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}`), {
            mapSelection: this.mapNumber,
            stage: "game loop"
        });
        const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete(snapshot.val());
        });
        CanvasManager.instance.setStage("game loop");
        CanvasManager.instance.setGame(this.mapNumber);
        CanvasManager.instance.setupGame();
    }
}
export { StartMenuCommand, HostOrJoinCommand, HostMenuCommand, JoinMenuCommand, PlantTower, towerMoveSelection, TowerSelectionCommand, moveEnemyCommand, JoinHostRoomCommand, LevelSelectionCommand, BeginGameCommand };
//# sourceMappingURL=command.js.map