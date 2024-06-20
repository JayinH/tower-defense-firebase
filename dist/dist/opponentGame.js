//@ts-ignore Import module
import { nanoid } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/3.3.4/nanoid.min.js";
import { CanvasManager } from "./canvasmanager.js";
import { EnemyMaker } from "./enemy.js";
import { GameCanvas } from "./gamecanvas.js";
import { GameTracker } from "./gametracker.js";
import { MapBuilder } from "./mapbuilder.js";
import { PathBlock } from "./pathclass.js";
import { TowerManager } from "./towerManager.js";
import { TowerModificationsManager } from "./towerModifications.js";
import { Wave } from "./wavemaker.js";
import { remove, get, update, onChildAdded, onChildRemoved, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
class OpponentGame {
    gameInstance;
    _active = true;
    FPS = 60;
    TIME_INTERVAL = 1000 / this.FPS;
    _enemyCounter = 0;
    _towerManager;
    _pathBlocks = [];
    _ENEMY_SPAWN_X = 0;
    _ENEMY_SPAWN_Y = 0;
    ENEMY_RADIUS = 20;
    _grassBlocks = [];
    _enemies = [];
    _wave = new Wave();
    _player;
    _ongoingWave = false;
    _gameTracker;
    _towerModificationsManager;
    path = [];
    mapSelection = 1;
    mainInterval;
    context = CanvasManager.GameCanvas.opponentContext;
    _mapBuilder;
    _mapInformation;
    _waveInfo = [[{ x: 1, y: 2, r: 3, level: 4 }], 0];
    _allEnemyInfo = this._waveInfo[0];
    _enemyInterval = 10;
    _id = nanoid(10);
    constructor(gameInstance) {
        this.gameInstance = gameInstance;
    }
    get id() {
        return this._id;
    }
    initialize(mapSelection, player) {
        this.context = CanvasManager.GameCanvas.opponentContext;
        this._towerManager = new TowerManager(this.context, this.gameInstance, "opponent");
        this._player = player;
        this.mapSelection = mapSelection;
        if (this.mapSelection === 1)
            this.path = [[0, 9], [1, 9], [2, 9], [3, 9], [3, 8], [3, 7], [2, 7], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 9], [7, 9], [7, 8], [7, 7], [7, 6], [7, 5], [7, 4], [7, 3], [7, 2], [8, 2]];
        if (this.mapSelection === 2)
            this.path = [[5, 0], [5, 1], [5, 2], [4, 2], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [6, 10], [5, 10], [4, 10], [3, 10], [2, 10], [1, 10], [1, 9], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [5, 7], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6]];
        this._mapBuilder = new MapBuilder(this.context, "#006400", "green", "orange", this.path, null, null, 12);
        this._gameTracker = new GameTracker(this._player, this.gameInstance, "opponent");
        this._towerModificationsManager = new TowerModificationsManager(this._player, this.gameInstance);
        this.initializeGame();
    }
    mainLoop() {
        this.mainInterval = setInterval(() => {
            if (!this._active)
                clearInterval(this.mainInterval);
            this.clearScreen();
            this.update();
            this.drawEverything();
        }, this.TIME_INTERVAL);
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
        * Ends the game when a player disconnects
        */
    handlePlayerDelete() {
        clearInterval(this.mainInterval);
        this.inactivate();
    }
    /**
  * Ends the wave when ongoing wave is equal to false
  * Ensures that the split screen has confirmed this before deleting it
  * the bullet counter resets, to ensure that it fires at the same time as the main screen during the next wave
  */
    listenForWaveEnd() {
        const waveEndRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/ongoingWave`);
        onChildAdded(waveEndRef, (snapshot) => {
            const waveEnd = snapshot.val();
            const waveKey = snapshot.key;
            if (waveEnd.ongoingWave === false && !waveEnd.confirmedByOpponent) {
                this._ongoingWave = false;
                for (let bulletTower of this.towerManager.bulletTowers) {
                    bulletTower.resetBulletCounter();
                }
                this._towerManager.inactivateBullets();
                this._enemies = [];
                this._player.receiveMoney(20);
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/ongoingWave/${waveKey}`), {
                    confirmedByOpponent: true
                }).then(() => {
                    if (waveEnd.confirmedByPlayer) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/ongoingWave/${waveKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing wave:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming wave end:', error);
                });
            }
        });
    }
    /**
       * Listens to see if any new enemies are added to the database
       * If a new enemy is added, it will spawn the enemy
       */
    listenForEnemies() {
        const enemiesRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/enemies`);
        onChildAdded(enemiesRef, (snapshot) => {
            const enemy = snapshot.val();
            const enemyKey = snapshot.key;
            if (enemy) {
                this.spawnEnemy(true, parseInt(enemy));
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
        this.listenForEnemies();
        this.towerManager.listenForNewTowerOpponent(this.player);
        this.listenForDisconnect();
        this.towerManager.listenForTowerUpgradesOpponent(this.player);
        this.listenForWaveEnd();
        if (this.active) {
            this._mapInformation = this._mapBuilder.buildMap();
            if (this._mapInformation) {
                this._grassBlocks = this._mapInformation[0];
                this._pathBlocks = this._mapInformation[1];
                this._towerManager.setEnemyPath(this._pathBlocks);
            }
            this._ENEMY_SPAWN_X = PathBlock.startpointX;
            this._ENEMY_SPAWN_Y = PathBlock.startpointY;
            CanvasManager.instance.SelectionCanvas.initialize();
            this._wave = new Wave();
            this._allEnemyInfo = this._wave.createNewWave()[0];
            this._gameTracker.totalEnemiesInWave = this._allEnemyInfo.length;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                currentWave: 0,
                doingWave: false,
                enemiesKilledInWave: this.gameTracker.enemiesKilledInWave,
                totalEnemiesInWave: this.gameTracker.totalEnemiesKilled,
                livesLostInWave: this.gameTracker.livesLostInWave,
                totalLivesLost: this.gameTracker.totalLivesLost,
                money: this.player.money,
                lives: this.player.lives,
            });
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
        this.updatePlayer();
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
    /**
     * Constantly checks how much money/lives the main player (opponent) has and updates accordingly
     */
    updatePlayer() {
        const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
        get(otherPlayerRef)
            .then((otherPlayerSnapshot) => {
            const otherPlayerData = otherPlayerSnapshot.val();
            this.player.money = otherPlayerData.money;
            this.player.lives = otherPlayerData.lives;
        })
            .catch((error) => {
            throw new Error("Error fetching other player status:", error);
        });
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
            this._towerManager.inactivateBullets();
            if (this.gameTracker.currentWave === 10) {
                this._active = false;
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
export { OpponentGame };
//# sourceMappingURL=opponentGame.js.map