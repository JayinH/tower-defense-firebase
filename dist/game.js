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
import { BulletTower, DirectionTower, LinearRadiusTower, LinearTower, PathTower } from "./tower.js";
class Game {
    _active = true;
    FPS = 60;
    TIME_INTERVAL = 1000 / this.FPS;
    _enemyCounter = 0;
    _towerManager;
    _pathBlocks = [];
    _ENEMY_SPAWN_X = 0;
    _ENEMY_SPAWN_Y = 0;
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
    constructor(
    // private mapSelection: number,
    ) {
        //    this.intialize(2);
    }
    get id() {
        return this._id;
    }
    initialize(mapSelection, player, mainOrOpponent) {
        // if(mainOrOpponent === "main") {
        player.resetStats();
        this.context = CanvasManager.GameCanvas.mainContext;
        // } else {
        //     this.context = CanvasManager.GameCanvas.opponentContext;
        // }
        this._towerManager = new TowerManager(this.context);
        this._player = player;
        console.log(this._player);
        this.mapSelection = mapSelection;
        if (this.mapSelection === 1)
            this.path = [[0, 9], [1, 9], [2, 9], [3, 9], [3, 8], [3, 7], [2, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 9], [7, 9], [7, 8], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2]];
        if (this.mapSelection === 2)
            this.path = [[5, 0], [5, 1], [5, 2], [4, 2], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [6, 10], [5, 10], [4, 10], [3, 10], [2, 10], [1, 10], [1, 9], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [5, 7], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6]];
        this._mapBuilder = new MapBuilder(this.context, "#006400", "green", "orange", this.path, null, null, 12);
        this._gameTracker = new GameTracker(this._player);
        this._towerModificationsManager = new TowerModificationsManager(this._player);
        this.initializeGame();
    }
    mainLoop() {
        return new Promise((resolve) => {
            this.mainInterval = setInterval(() => {
                if (this._active === false) {
                    clearInterval(this.mainInterval);
                    const points = this.gameTracker.totalEnemiesKilled * 3 + this.player.lives * 15;
                    if (this.player.lost || this.player.won) {
                        if (this.player.lost) {
                            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: false,
                                lost: true,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave
                            });
                            setTimeout(() => {
                                resolve(["You lost.", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave - 1, points]);
                            }, 300);
                        }
                        else {
                            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: true,
                                lost: false,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave
                            });
                            setTimeout(() => {
                                resolve(["You won!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave, points]);
                            }, 300);
                        }
                    }
                    else {
                        if (this.gameTracker.currentWave === 10 && this.player.isAlive) {
                            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: true,
                                lost: false,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave - 1
                            });
                            setTimeout(() => {
                                resolve(["You won!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave, points]);
                            }, 300);
                        }
                        else {
                            update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}`), {
                                isAlive: false,
                                won: false,
                                lost: true,
                                enemiesKilled: this.gameTracker.totalEnemiesKilled,
                                wavesCompleted: this.gameTracker.currentWave
                            });
                            setTimeout(() => {
                                resolve(["You lost!", this.gameTracker.totalEnemiesKilled, this.gameTracker.currentWave, points]);
                            }, 300);
                        }
                    }
                }
                this.modifyEnemySendButtons();
                this.clearScreen();
                this.update();
                this.drawEverything();
                Controller.instance.inputHandler();
            }, this.TIME_INTERVAL);
        });
    }
    modifyEnemySendButtons() {
        const allButtons = document.querySelectorAll('.send-enemy-button');
        const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.opponentId}`);
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
                        console.log(otherPlayerWave);
                        let enemyLag = 0;
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
                                if (this.player.money < 15) {
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
            else {
                console.error("No data available for the other player.");
            }
        })
            .catch((error) => {
            console.error("Error fetching other player status:", error);
        });
    }
    addSpawnEnemyEventListeners() {
        const allButtons = document.querySelectorAll('.send-enemy-button');
        for (let button of allButtons) {
            console.log('button clicked');
            const currentButton = button;
            currentButton.addEventListener('click', e => {
                const enemiesRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.opponentId}/enemies`);
                console.log(CanvasManager.instance.opponentId);
                // Use push to add the enemy value to the array-like structure
                console.log(currentButton.value);
                push(enemiesRef, (currentButton.value))
                    .then(() => {
                    if (parseInt(currentButton.value) === 1) {
                        this.player.spendMoney(10);
                    }
                    if (parseInt(currentButton.value) === 2 || parseInt(currentButton.value) === 3) {
                        this.player.spendMoney(15);
                    }
                    if (parseInt(currentButton.value) === 4) {
                        this.player.spendMoney(50);
                    }
                    if (parseInt(currentButton.value) === 5) {
                        this.player.spendMoney(15);
                    }
                    if (parseInt(currentButton.value) === 6) {
                        this.player.spendMoney(17);
                    }
                    // this.opponentGame.spawnEnemy(true, parseInt(currentButton.value))
                    console.log('Enemy added successfully');
                })
                    .catch((error) => {
                    console.error('Error adding enemy:', error);
                });
            });
        }
    }
    listenForPlayerDeath() {
        const playerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.opponentId}`);
        onValue(playerRef, (snapshot) => {
            const information = snapshot.val();
            if (information.isAlive === false) {
                // Execute code when the opponent player is dead
                if (information.won) {
                    this.player.lost = true;
                }
                else {
                    this.player.won = true;
                }
                console.log('Opponent player is dead');
                this.inactivate();
                // Run any additional code you need when the player is dead
                // For example, you might want to update the game state or notify the player
            }
        });
    }
    listenForEnemies() {
        const enemiesRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}/enemies`);
        onChildAdded(enemiesRef, (snapshot) => {
            const enemy = snapshot.val();
            const enemyKey = snapshot.key;
            if (enemy) {
                // Run your code to handle the new enemy here
                console.log('New enemy added:', enemy);
                // After handling the enemy, remove it from the database
                // remove(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}/enemies/${enemyKey}`))
                //     .then(() => {
                this.spawnEnemy(true, parseInt(enemy));
                //     console.log('Enemy removed successfully');
                // })
                // .catch((error) => {
                //     console.error('Error removing enemy:', error);
                // });
            }
        });
    }
    listenForTowerUpgrades() {
        const towersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades`);
        onChildAdded(towersRef, (snapshot) => {
            const towerUpgrade = snapshot.val();
            // console.log(tower);
            const towerKey = snapshot.key;
            if (towerUpgrade) {
                // Run your code to handle the new tower here
                const selectedTower = this.towerManager.towers[towerUpgrade.towerIndex];
                this.player.spendMoney(selectedTower.upgradeCost);
                selectedTower.increaseUpgradeCost();
                if (towerUpgrade.upgrade === "Increase Speed") {
                    selectedTower.addUpgrade("Increase Speed");
                    if (selectedTower instanceof BulletTower)
                        selectedTower.upgradeSpeed();
                }
                else if (towerUpgrade.upgrade === "Random Bullet Color") {
                    selectedTower.addUpgrade("Random Bullet Color");
                    if (selectedTower instanceof LinearTower)
                        selectedTower.randomizeBulletColor();
                }
                else if (towerUpgrade.upgrade === "Increase Attack") {
                    selectedTower.addUpgrade("Increase Attack");
                    if (selectedTower instanceof LinearTower || selectedTower instanceof PathTower)
                        selectedTower.upgradeAttack();
                }
                else if (towerUpgrade.upgrade === "Increase Firing Radius") {
                    selectedTower.addUpgrade("Increase Firing Radius");
                    if (selectedTower instanceof LinearRadiusTower)
                        selectedTower.upgradeFiringRadius();
                }
                else if (towerUpgrade.direction) {
                    selectedTower.addUpgrade(towerUpgrade.upgrade);
                    if (selectedTower instanceof DirectionTower)
                        selectedTower.addDirection(towerUpgrade.direction);
                }
                // Create a reference to the tower in the database
                const towersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades`);
                // After handling the tower, remove it from the database
                update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades/${towerKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    // Check if opponent has also confirmed
                    console.log(towerUpgrade.confirmedByOpponent);
                    if (towerUpgrade.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades/${towerKey}`)).then(() => {
                            console.log('Tower upgraded successfully');
                        }).catch((error) => {
                            console.error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    console.error('Error confirming tower upgrade:', error);
                });
            }
        });
    }
    listenForWaveEnd() {
        const waveEndRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}/ongoingWave`);
        onChildAdded(waveEndRef, (snapshot) => {
            const waveEnd = snapshot.val();
            const waveKey = snapshot.key;
            if (waveEnd.ongoingWave === false && !waveEnd.confirmedByPlayer) {
                // Run your code to handle the new tower here
                update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}`), {
                    currentWave: this.gameTracker.currentWave,
                    doingWave: false
                });
                this._ongoingWave = false;
                for (let bulletTower of this.towerManager.bulletTowers) {
                    bulletTower.resetBulletCounter();
                }
                console.log('ending wave');
                // Create a reference to the tower in the database
                const towersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/ongoingWave`);
                // After handling the tower, remove it from the database
                update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/ongoingWave/${waveKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    // Check if opponent has also confirmed
                    if (waveEnd.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/ongoingWave/${waveKey}`)).then(() => {
                            console.log('Wave ended');
                        }).catch((error) => {
                            console.error('Error removing wave:', error);
                        });
                    }
                }).catch((error) => {
                    console.error('Error confirming wave end:', error);
                });
            }
        });
    }
    listenForNewTower() {
        const towerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers`);
        onChildAdded(towerRef, (snapshot) => {
            const tower = snapshot.val();
            const towerKey = snapshot.key;
            if (tower && !tower.confirmedByPlayer) {
                // Run your code to handle the new tower here
                if (tower.type === "Linear") {
                    // console.log('adde on game side')
                    // console.log(CanvasManager.instance.player.id)
                    const newTower = new LinearTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.towerManager.enemyPath);
                    this.towerManager.towers.push(newTower);
                    this.towerManager.bulletTowers.push(newTower);
                    this.player.spendMoney(LinearTower.cost);
                }
                else if (tower.type === "Direction") {
                    const newTower = new DirectionTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, [tower.direction]);
                    this.towerManager.towers.push(newTower);
                    this.towerManager.bulletTowers.push(newTower);
                    this.player.spendMoney(DirectionTower.cost);
                }
                else if (tower.type === "Linear Radius") {
                    const newTower = new LinearRadiusTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.towerManager.enemyPath);
                    this.towerManager.towers.push(newTower);
                    this.towerManager.bulletTowers.push(newTower);
                    this.player.spendMoney(LinearRadiusTower.cost);
                }
                else if (tower.type === "Path") {
                    const newTower = new PathTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50);
                    this.towerManager.towers.push(newTower);
                    this.player.spendMoney(PathTower.cost);
                }
                // Create a reference to the tower in the database
                const towerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers`);
                // After handling the tower, remove it from the database
                update(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers/${towerKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    // Check if opponent has also confirmed
                    if (tower.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers/${towerKey}`)).then(() => {
                            // console.log('Wave ended');
                        }).catch((error) => {
                            console.error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    console.error('Error confirming tower end:', error);
                });
            }
        });
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
     * Sets the spawnpoints for the enemies
     * Creates a controller to handle inputs and builds the map
     * Creates a canvas for the user to select enemies
     * Begins a new wave and updates the game tracker and enemy info accordingly
     */
    initializeGame() {
        this.listenForNewTower();
        this.listenForDisconnect();
        this.listenForEnemies();
        this.listenForPlayerDeath();
        this.addSpawnEnemyEventListeners();
        this.listenForTowerUpgrades();
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
            // CanvasManager.SelectionCanvas;
            CanvasManager.instance.SelectionCanvas.initialize();
            this._wave = new Wave();
            this._allEnemyInfo = this._wave.createNewWave()[0];
            this._gameTracker.totalEnemiesInWave = this._allEnemyInfo.length;
            this.opponentGame = new OpponentGame();
            this.opponentGame.initialize(this.mapSelection, new Player(CanvasManager.instance.opponent.nickname, "opponent"), "opponent");
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
        if (!this.player.isAlive)
            this.inactivate();
    }
    inactivate() {
        this._active = false;
    }
    get active() {
        return this._active;
    }
    /**
     * First, goes through all the enemies and check if any of them have died. If so, the screen updates.
     * All the inactive (dead/made it to the end) enemies are removed from the enemies array
     * The towers enemies array is modified accordingly
     * If there are no active enemies and no enemies left to spawn, the bullets are inactivated,
     * the wave is over, and the player receives money.
     */
    handlePlayerDelete() {
        clearInterval(this.mainInterval);
        this.inactivate();
    }
    listenForDisconnect() {
        const playersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players`);
        onChildRemoved(playersRef, (snapshot) => {
            this.handlePlayerDelete();
        });
    }
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
                push(ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${this.player.id}/ongoingWave`), {
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
/**
 * NEXT STEPS:
 * latency is better
 * lie about lives in the mirror screen since its basically correct
 * make play again work -> maybe
 * remove linear radius tower switch between modes?
 * fix points and stuff
 * add disconnect
 * add costs for sending enemies
 * set money to be the same based on the main game
 * ask abt latency and switching tabs
 */ 
//# sourceMappingURL=game.js.map