//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { CanvasManager } from "./canvasmanager.js";
import { Controller } from "./controller.js";
import { EnemyMaker } from "./enemy.js";
import { GameCanvas } from "./gamecanvas.js";
import { GameTracker } from "./gametracker.js";
import { MapBuilder } from "./mapbuilder.js";
import { PathBlock } from "./pathclass.js";
import { Player } from "./player.js";
import { TowerManager } from "./towerManager.js";
import { TowerModificationsManager } from "./towerModifications.js";
import { Wave } from "./wavemaker.js";
import { onValue, push, remove, update, get, onChildAdded, onChildRemoved, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
import { OpponentGame } from "./opponentGame.js";
class Game {
    _active = true;
    FPS = 60;
    TIME_INTERVAL = 1000 / this.FPS;
    gameInstance;
    _enemyCounter = 0;
    _towerManager;
    _pathBlocks = [];
    _ENEMY_SPAWN_X = 0;
    _ENEMY_SPAWN_Y = 0;
    playerDeathUnsubscribe;
    spawnEnemyEventListeners = [];
    enemiesUnsubscribe = null;
    waveEndUnsubscribe = null;
    endWaveMessageSent = false;
    ENEMY_RADIUS = 20;
    opponentGame;
    _grassBlocks = [];
    _enemies = [];
    _wave = new Wave();
    _player;
    _ongoingWave = false;
    _gameTracker;
    _towerModificationsManager;
    path = [];
    mapSelection = 1;
    context;
    mainInterval;
    _mapBuilder;
    _mapInformation;
    _waveInfo = [[{ x: 1, y: 2, r: 3, level: 4 }], 0];
    _allEnemyInfo = this._waveInfo[0];
    _enemyInterval = 10;
    _id = nanoid(10);
    constructor() { }
    get id() {
        return this._id;
    }
    initialize(mapSelection, player, gameInstance) {
        player.resetStats(this.gameInstance);
        this._active = true;
        this.context = CanvasManager.GameCanvas.mainContext;
        this.gameInstance = gameInstance;
        this._towerManager = new TowerManager(this.context, this.gameInstance);
        this._player = player;
        this.mapSelection = mapSelection;
        if (this.mapSelection === 1)
            this.path = [[0, 9], [1, 9], [2, 9], [3, 9], [3, 8], [3, 7], [2, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 9], [7, 9], [7, 8], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2]];
        if (this.mapSelection === 2)
            this.path = [[5, 0], [5, 1], [5, 2], [4, 2], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [6, 10], [5, 10], [4, 10], [3, 10], [2, 10], [1, 10], [1, 9], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [5, 7], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6]];
        this._mapBuilder = new MapBuilder(this.context, "#006400", "green", "orange", this.path, null, null, 12);
        this._gameTracker = new GameTracker(this._player, this.gameInstance);
        this._towerModificationsManager = new TowerModificationsManager(this._player, this.gameInstance);
        this.initializeGame();
    }
    /**
     * If the game is no longer active, the main loop stops
     * The winner is determined and the game ends, returning data about who won and how many waves were completed
     * A 300 ms second delay is placed so that the database has time to be updated before it's read
     */
    mainLoop() {
        return new Promise((resolve) => {
            this.mainInterval = setInterval(() => {
                if (!this._active) {
                    clearInterval(this.mainInterval);
                    if (this.player.lost || this.player.won) {
                        if (this.player.lost) {
                            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: false,
                                lost: true,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave - 1
                            });
                            this.opponentGame.inactivate();
                            setTimeout(() => {
                                resolve(["You lost.", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave - 1]);
                            }, 300);
                        }
                        else {
                            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: true,
                                lost: false,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave - 1
                            });
                            this.opponentGame.inactivate();
                            setTimeout(() => {
                                resolve(["You won!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave]);
                            }, 300);
                        }
                    }
                    else {
                        if (this.gameTracker.currentWave === 10 && this.player.isAlive) {
                            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: true,
                                lost: false,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave
                            });
                            this.opponentGame.inactivate();
                            setTimeout(() => {
                                resolve(["You won!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave]);
                            }, 300);
                        }
                        else {
                            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: false,
                                lost: true,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave - 1
                            });
                            this.opponentGame.inactivate();
                            setTimeout(() => {
                                resolve(["You lost!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave]);
                            }, 300);
                        }
                    }
                }
                this.clearScreen();
                this.update();
                this.drawEverything();
                Controller.instance.inputHandler();
            }, this.TIME_INTERVAL);
        });
    }
    /**
     * The spawn enemy buttons are placed when the opponent has completed the wave in which the enemy appears
     * The buttons are hidden when the opponent is in between waves
     * The buttons are disabled when the user cannot afford them
     */
    modifyEnemySendButtons() {
        const allButtons = document.querySelectorAll('.send-enemy-button');
        const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
        get(otherPlayerRef)
            .then((otherPlayerSnapshot) => {
            const otherPlayerData = otherPlayerSnapshot.val();
            if (otherPlayerData) {
                const otherPlayerWave = parseInt(otherPlayerData.currentWave);
                for (let button of allButtons) {
                    const currentButton = button;
                    if (!otherPlayerData.doingWave) {
                        currentButton.hidden = true;
                    }
                    else {
                        let enemyLag = -0;
                        if (parseInt(currentButton.value) >= 4)
                            enemyLag = 1;
                        if (parseInt(currentButton.value) + enemyLag < otherPlayerWave) {
                            if (parseInt(currentButton.value) === 1) {
                                if (this.player.money < 10) {
                                    currentButton.disabled = true;
                                }
                                else {
                                    currentButton.disabled = false;
                                }
                            }
                            else if (parseInt(currentButton.value) === 2 || parseInt(currentButton.value) === 3) {
                                if (this.player.money < 12) {
                                    currentButton.disabled = true;
                                }
                                else {
                                    currentButton.disabled = false;
                                }
                            }
                            else if (parseInt(currentButton.value) === 4) {
                                if (this.player.money < 50) {
                                    currentButton.disabled = true;
                                }
                                else {
                                    currentButton.disabled = false;
                                }
                            }
                            if (parseInt(currentButton.value) === 5) {
                                if (this.player.money < 15) {
                                    currentButton.disabled = true;
                                }
                                else {
                                    currentButton.disabled = false;
                                }
                            }
                            if (parseInt(currentButton.value) === 6) {
                                if (this.player.money < 17) {
                                    currentButton.disabled = true;
                                }
                                else {
                                    currentButton.disabled = false;
                                }
                            }
                            currentButton.hidden = false;
                        }
                        else {
                            currentButton.hidden = true;
                        }
                    }
                }
            }
        });
    }
    /**
     * Removes event listeners from all the spawn enemy buttons
     */
    removeSpawnEnemyEventListeners() {
        for (let { button, listener } of this.spawnEnemyEventListeners) {
            button.removeEventListener('click', listener);
        }
        this.spawnEnemyEventListeners = [];
    }
    /**
     * Removes all other event listeners to ensure no duplicates
     * Adds an enemy to the database depending on the button pressed and spends player's money
     */
    addSpawnEnemyEventListeners() {
        this.removeSpawnEnemyEventListeners();
        const allButtons = document.querySelectorAll('.send-enemy-button');
        for (let button of allButtons) {
            const currentButton = button;
            const listener = (e) => {
                const enemiesRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/enemies`);
                push(enemiesRef, currentButton.value)
                    .then(() => {
                    const value = parseInt(currentButton.value);
                    if (value === 1) {
                        this.player.spendMoney(10);
                    }
                    else if (value === 2 || value === 3) {
                        this.player.spendMoney(15);
                    }
                    else if (value === 4) {
                        this.player.spendMoney(50);
                    }
                    else if (value === 5) {
                        this.player.spendMoney(15);
                    }
                    else if (value === 6) {
                        this.player.spendMoney(17);
                    }
                });
            };
            currentButton.addEventListener('click', listener);
            this.spawnEnemyEventListeners.push({ button: currentButton, listener });
        }
    }
    /**
     * Ensures that there are no duplicates of the event
     * Checks the opponent's status (alive or not) and updats accordingly
     */
    listenForPlayerDeath() {
        if (this.playerDeathUnsubscribe) {
            this.playerDeathUnsubscribe();
        }
        const playerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
        this.playerDeathUnsubscribe = onValue(playerRef, (snapshot) => {
            const information = snapshot.val();
            if (information.isAlive === false) {
                if (information.won) {
                    this.player.lost = true;
                    this.player.won = false;
                }
                else {
                    this.player.won = true;
                    this.player.lost = false;
                }
                this.inactivate();
            }
        });
    }
    /**
     * Stops the event listener to check the opponent's status
     */
    stopListeningForPlayerDeath() {
        if (this.playerDeathUnsubscribe) {
            this.playerDeathUnsubscribe();
            this.playerDeathUnsubscribe = null;
        }
    }
    /**
     * Deletes all ongoing listeners
     */
    destroy() {
        this.stopListeningForPlayerDeath();
        this.stopListeningForEnemies();
        this.stopListeningForWaveEnd();
        this.removeSpawnEnemyEventListeners();
    }
    /**
     * Removes the enemies listener
     */
    stopListeningForEnemies() {
        if (this.enemiesUnsubscribe) {
            this.enemiesUnsubscribe();
            this.enemiesUnsubscribe = null;
        }
    }
    /**
     * Listens to see if any new enemies are added to the database
     * If a new enemy is added, it will spawn the enemy
     */
    listenForEnemies() {
        this.stopListeningForEnemies();
        const enemiesRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}/enemies`);
        this.enemiesUnsubscribe = onChildAdded(enemiesRef, (snapshot) => {
            const enemy = snapshot.val();
            if (enemy) {
                this.spawnEnemy(true, parseInt(enemy));
            }
        }, { onlyOnce: false });
    }
    /**
     * Removes existing listeners
     */
    stopListeningForWaveEnd() {
        if (this.waveEndUnsubscribe) {
            this.waveEndUnsubscribe();
            this.waveEndUnsubscribe = null;
        }
    }
    /**
     * Ends the wave when ongoing wave is equal to false
     * Ensures that the split screen has confirmed this before deleting it
     * the bullet counter resets, to ensure that it fires at the same time as the split screen during the next wave
     */
    listenForWaveEnd() {
        this.stopListeningForWaveEnd();
        const waveEndRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}/ongoingWave`);
        this.waveEndUnsubscribe = onChildAdded(waveEndRef, (snapshot) => {
            const waveEnd = snapshot.val();
            const waveKey = snapshot.key;
            if (waveEnd.ongoingWave === false && !waveEnd.confirmedByPlayer) {
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}`), {
                    currentWave: this.gameTracker.currentWave,
                    doingWave: false
                });
                this._ongoingWave = false;
                for (let bulletTower of this.towerManager.bulletTowers) {
                    bulletTower.resetBulletCounter();
                }
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/ongoingWave/${waveKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    if (waveEnd.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/ongoingWave/${waveKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing wave:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming wave end:', error);
                });
            }
        }, { onlyOnce: false });
    }
    // Getters
    get enemyCounter() {
        return this._enemyCounter;
    }
    get towerManager() {
        return this._towerManager;
    }
    get pathBlocks() {
        return this._pathBlocks;
    }
    get ENEMY_SPAWN_X() {
        return this._ENEMY_SPAWN_X;
    }
    get ENEMY_SPAWN_Y() {
        return this._ENEMY_SPAWN_Y;
    }
    get grassBlocks() {
        return this._grassBlocks;
    }
    get enemies() {
        return this._enemies;
    }
    get wave() {
        return this._wave;
    }
    get player() {
        return this._player;
    }
    get ongoingWave() {
        return this._ongoingWave;
    }
    get gameTracker() {
        return this._gameTracker;
    }
    get towerModificationsManager() {
        return this._towerModificationsManager;
    }
    get mapBuilder() {
        return this._mapBuilder;
    }
    get mapInformation() {
        return this._mapInformation;
    }
    get waveInfo() {
        return this._waveInfo;
    }
    get allEnemyInfo() {
        return this._allEnemyInfo;
    }
    get enemyInterval() {
        return this._enemyInterval;
    }
    /**
     * Listeners are set up to run throughout the course of the game
     * Sets the spawnpoints for the enemies
     * Creates a controller to handle inputs and builds the map
     * Creates a canvas for the user to select enemies
     * Begins a new wave and updates the game tracker and enemy info accordingly
     */
    initializeGame() {
        this.listenForDisconnect();
        this.listenForEnemies();
        this.listenForPlayerDeath();
        this.addSpawnEnemyEventListeners();
        this._towerManager.listenForTowerUpgradesMain(this.player);
        this._towerManager.listenForNewTowerMain(this.player);
        this.listenForWaveEnd();
        if (this.active) {
            Controller.instance.setInfo(this._towerManager, this._player, this._towerModificationsManager);
            this._mapInformation = this._mapBuilder.buildMap();
            if (this._mapInformation) {
                this._grassBlocks = this._mapInformation[0];
                this._pathBlocks = this._mapInformation[1];
                this._towerManager.setEnemyPath(this._pathBlocks);
            }
            this._ENEMY_SPAWN_X = PathBlock.startpointX;
            this._ENEMY_SPAWN_Y = PathBlock.startpointY;
            Controller.instance.setBlocks(this._grassBlocks, this._pathBlocks);
            CanvasManager.instance.SelectionCanvas.initialize();
            this._wave = new Wave();
            this._allEnemyInfo = this._wave.createNewWave()[0];
            this._gameTracker.totalEnemiesInWave = this._allEnemyInfo.length;
            this.opponentGame = new OpponentGame(this.gameInstance);
            this.opponentGame.initialize(this.mapSelection, new Player(CanvasManager.instance.opponent.nickname, "opponent"));
            this.opponentGame.mainLoop();
        }
    }
    /**
     * Inactivates the game if the player is dead
     * Updates the side menu according to the players money
     * If a wave is going, everything will be updated accordingly.
     * Otherwise, the countdown will be called (through game tracker)
     */
    update() {
        this.checkPlayerStatus();
        this._towerModificationsManager.update();
        this.modifyEnemySendButtons();
        if (this._ongoingWave) {
            this.updateEnemies();
            this._towerManager.manageBullets();
            this.manageSpawnEnemy();
            this.updateEnemies();
            this.updateBullets();
            this.moveEnemy();
            this._gameTracker.manage();
        }
        else {
            this._enemyCounter = 0;
            this.checkIfTimeToStartWave();
            this._gameTracker.manageInBetweenWaves();
        }
    }
    checkPlayerStatus() {
        this.player.won = false;
        this.player.lost = true;
        if (!this.player.isAlive)
            this.inactivate();
    }
    inactivate() {
        this.destroy();
        this.towerManager.destroy();
        this._active = false;
    }
    get active() {
        return this._active;
    }
    /**
     * Ends the game when a player disconnects
     */
    handlePlayerDelete() {
        clearInterval(this.mainInterval);
        this.inactivate();
    }
    /**
     * Handles players disconnecting from the game
     */
    listenForDisconnect() {
        const playersRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players`);
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete();
        });
    }
    /**
     * First, goes through all the enemies and check if any of them have died. If so, the screen updates.
     * All the inactive (dead/made it to the end) enemies are removed from the enemies array
     * The towers enemies array is modified accordingly
     * If there are no active enemies and no enemies left to spawn, the bullets are inactivated,
     * the wave is over, and the player receives money.
     */
    updateEnemies() {
        for (let enemy of this._enemies) {
            if (!enemy.isAlive) {
                this._gameTracker.enemyKilled();
            }
            if (enemy.madeItToEnd) {
                this._gameTracker.loseLife();
            }
        }
        this._enemies = this._enemies.filter(enemy => enemy.active);
        this._towerManager.updateEnemies(this._enemies);
        if (!this._enemies.length && !this._allEnemyInfo.length) {
            if (!this.endWaveMessageSent) {
                this._player.receiveMoney(20);
                this._towerManager.inactivateBullets();
                // this._ongoingWave = false;
                push(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${this.player.id}/ongoingWave`), {
                    ongoingWave: false,
                    confirmedByPlayer: false,
                    confirmedByOpponent: false
                });
                if (this.gameTracker.currentWave === 10) {
                    this._active = false;
                }
                this.endWaveMessageSent = true;
            }
        }
    }
    /**
     * If enemyInterval amount of time has passed (ms) a new enemy will be spawned
     */
    manageSpawnEnemy() {
        if ((this._enemyCounter >= this._enemyInterval / this.TIME_INTERVAL)) {
            this.spawnEnemy();
            this._enemyCounter = 0;
        }
        else {
            this._enemyCounter++;
        }
    }
    /**
     * If the button was clicked, new info would be added to the allEnemyInfo array
     * the information from allEnemyInfo is passed in to EnemyMaker to create a new enemy
     * The newly created enemy is added to the enemies array
     */
    spawnEnemy(spawnButtonClicked, enemyLevel) {
        if (spawnButtonClicked && enemyLevel) {
            this._allEnemyInfo.unshift({ x: this._ENEMY_SPAWN_X, y: this._ENEMY_SPAWN_Y, r: this.ENEMY_RADIUS, level: enemyLevel });
            this.gameTracker.increaseEnemiesInWave();
        }
        if (this._allEnemyInfo.length) {
            const enemyMaker = new EnemyMaker(this.context, this._allEnemyInfo[0].x, this._allEnemyInfo[0].y, this._allEnemyInfo[0].r, this._pathBlocks, this._player, this._allEnemyInfo[0].level);
            const newEnemy = enemyMaker.makeEnemy();
            this._allEnemyInfo.shift();
            this._enemies.push(newEnemy);
        }
    }
    /**
     * If the bullet interval amount of time has passed (ms) a new bullet will be fired
     */
    updateBullets() {
        for (let i = 0; i < this._towerManager.bulletTowers.length; i++) {
            if (this._towerManager.bulletTowers[i].bulletCounter >= this._towerManager.bulletTowers[i].towerSpd / this.TIME_INTERVAL) {
                this._towerManager.fire(i);
                this._towerManager.bulletTowers[i].resetBulletCounter();
            }
            else {
                this._towerManager.bulletTowers[i].increaseBulletCounter();
            }
        }
    }
    moveEnemy() {
        for (let enemy of this._enemies) {
            enemy.move();
        }
    }
    /**
     * In between waves, if the countdown is over, a new wave will be started
     */
    checkIfTimeToStartWave() {
        if (this._gameTracker.countdownCounter >= this._gameTracker.countdownInterval / this.TIME_INTERVAL) {
            if (this._gameTracker.runCountdown() == false) {
                this._ongoingWave = true;
                this.endWaveMessageSent = false;
                this._waveInfo = this._wave.createNewWave();
                this._allEnemyInfo = this._waveInfo[0];
                this._enemyInterval = this._waveInfo[1];
                this._gameTracker.waveStart(this._allEnemyInfo.length);
            }
            this._gameTracker.resetCoundtownCounter();
        }
        else {
            this._gameTracker.increaseCountdownCounter();
        }
    }
    drawEverything() {
        this.drawGrass();
        this.drawPath();
        this.drawPathTowers();
        this.drawBullets();
        this.drawEnemies();
        this.drawBulletTowers();
        this.drawEnemyHealthBars();
    }
    drawGrass() {
        for (let grass of this._grassBlocks) {
            grass.draw();
        }
    }
    drawPath() {
        for (let pathBlock of this._pathBlocks) {
            pathBlock.draw();
        }
    }
    drawPathTowers() {
        this._towerManager.drawPathTowers();
    }
    drawBulletTowers() {
        this._towerManager.drawBulletTowers();
    }
    drawBullets() {
        this._towerManager.drawBullets();
    }
    drawEnemies() {
        for (let enemy of this._enemies) {
            enemy.draw();
        }
    }
    drawEnemyHealthBars() {
        for (let enemy of this._enemies) {
            if (enemy.healthBar)
                enemy.healthBar.draw();
        }
    }
    clearScreen() {
        this.context.clearRect(0, 0, GameCanvas.WIDTH, GameCanvas.HEIGHT);
    }
}
export { Game };
//# sourceMappingURL=game.js.map