import { CanvasManager } from "./canvasmanager.js";
import { update, ref, get
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
class GameTracker {
    player;
    gameInstance;
    opponentOrMain;
    _currentWave = 0;
    _enemiesKilledInWave = 0;
    _totalEnemiesInWave = 0;
    _totalEnemiesKilled = 0;
    _livesLostInWave = 0;
    _totalLivesLost = 0;
    _countdownStart = 10;
    _currentCountdown = 10;
    countdownInterval = 1000;
    _countdownCounter = 0;
    _topMenu = document.querySelector('.top-menu');
    _livesText = this._topMenu.querySelector('.lives');
    _moneyText = this._topMenu.querySelector('.money');
    _waveText = this._topMenu.querySelector('.wave');
    _enemiesKilledText = this._topMenu.querySelector('.enemies-killed');
    _livesLostText = this._topMenu.querySelector('.lives-lost');
    _livesAtStartOfWave = 50;
    constructor(player, gameInstance, opponentOrMain) {
        this.player = player;
        this.gameInstance = gameInstance;
        this.opponentOrMain = opponentOrMain;
        if (opponentOrMain === "opponent") {
            this._topMenu = document.querySelector('.opponent-top-menu');
            this._livesText = this._topMenu.querySelector('.lives');
            this._moneyText = this._topMenu.querySelector('.money');
            this._waveText = this._topMenu.querySelector('.wave');
            this._enemiesKilledText = this._topMenu.querySelector('.enemies-killed');
            this._livesLostText = this._topMenu.querySelector('.lives-lost');
        }
        this._livesAtStartOfWave = player.lives;
    }
    // Getters for private variables
    get currentWave() {
        return this._currentWave;
    }
    get enemiesKilledInWave() {
        return this._enemiesKilledInWave;
    }
    get totalEnemiesInWave() {
        return this._totalEnemiesInWave;
    }
    get totalEnemiesKilled() {
        return this._totalEnemiesKilled;
    }
    get livesLostInWave() {
        return this._livesLostInWave;
    }
    get totalLivesLost() {
        return this._totalLivesLost;
    }
    get countdownStart() {
        return this._countdownStart;
    }
    get currentCountdown() {
        return this._currentCountdown;
    }
    get countdownCounter() {
        return this._countdownCounter;
    }
    get livesText() {
        return this._livesText;
    }
    get moneyText() {
        return this._moneyText;
    }
    get waveText() {
        return this._waveText;
    }
    get enemiesKilledText() {
        return this._enemiesKilledText;
    }
    get livesLostText() {
        return this._livesLostText;
    }
    resetCoundtownCounter() {
        this._countdownCounter = 0;
    }
    increaseCountdownCounter() {
        this._countdownCounter++;
    }
    /**
     * The database is updated when a player loses a life
     */
    loseLife() {
        if (this.opponentOrMain !== "opponent") {
            this._livesLostInWave++;
            this._totalLivesLost++;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                livesLostInWave: this._livesLostInWave,
                totalLivesLost: this._totalLivesLost
            }).then(() => { });
        }
    }
    /**
     * Updates the screen with all of the following information during waves
     * The split screen data replicates that of the main screen
     */
    manage() {
        if (this.opponentOrMain === "opponent") {
            const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
            get(otherPlayerRef)
                .then((otherPlayerSnapshot) => {
                const otherPlayerData = otherPlayerSnapshot.val();
                this._livesLostInWave = otherPlayerData.livesLostInWave;
                this._totalLivesLost = otherPlayerData.totalLivesLost;
                this._totalEnemiesKilled = otherPlayerData.totalEnemiesKilled;
                this._enemiesKilledInWave = otherPlayerData.enemiesKilledInWave;
                this._totalEnemiesInWave = otherPlayerData.totalEnemiesInWave;
            });
        }
        this.displayMoney();
        this.displayCurrentWave();
        this.displayLives();
        this.displayEnemiesInWaveInfo();
        this.displayLivesLostInWaves();
    }
    displayMoney() {
        this.moneyText.innerHTML = `Money: $${this.player.money}`;
    }
    /**
     * Updates the screen with all of the following information in between waves
     * The split screen data relicates the main screen
     */
    manageInBetweenWaves() {
        if (this.opponentOrMain === "opponent") {
            const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
            get(otherPlayerRef)
                .then((otherPlayerSnapshot) => {
                const otherPlayerData = otherPlayerSnapshot.val();
                this._livesLostInWave = otherPlayerData.livesLostInWave;
                this._totalLivesLost = otherPlayerData.totalLivesLost;
                if (otherPlayerData.totalEnemiesKilled) {
                    this._totalEnemiesKilled = otherPlayerData.totalEnemiesKilled;
                }
                else {
                    this._totalEnemiesKilled = 0;
                }
                this._enemiesKilledInWave = otherPlayerData.enemiesKilledInWave;
                this._totalEnemiesInWave = otherPlayerData.totalEnemiesInWave;
            });
        }
        this.displayMoney();
        this.displayNextWave();
        this.displayLives();
        this.displayTotalEnemiesKilledInfo();
        this.displayCountdown();
    }
    displayCurrentWave() {
        this.waveText.innerHTML = `\nCurrent Wave: ${this.currentWave}`;
    }
    set totalEnemiesInWave(enemiesAmount) {
        this._totalEnemiesInWave = enemiesAmount;
    }
    displayLives() {
        this.livesText.innerHTML = `\nLives: ${this.player.lives}`;
    }
    displayNextWave() {
        this.waveText.innerHTML = `\nPreparing to start Wave ${this.currentWave + 1}`;
    }
    displayTotalEnemiesKilledInfo() {
        this.enemiesKilledText.innerHTML = `\nTotal Enemies killed: ${this.totalEnemiesKilled}`;
    }
    displayEnemiesInWaveInfo() {
        this.enemiesKilledText.innerHTML = `\nEnemies killed in wave: ${this._enemiesKilledInWave}/${this._totalEnemiesInWave}`;
    }
    increaseEnemiesInWave() {
        if (this.opponentOrMain !== "opponent") {
            this._totalEnemiesInWave++;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                totalEnemiesInWave: this._totalEnemiesInWave
            }).then(() => { });
        }
    }
    displayLivesLostInWaves() {
        this.livesLostText.innerHTML = `\nLives lost in wave: ${this._livesAtStartOfWave - this.player.lives}`;
    }
    enemyKilled() {
        if (this.opponentOrMain !== "opponent") {
            this._totalEnemiesKilled++;
            this._enemiesKilledInWave++;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                enemiesKilledInWave: this.enemiesKilledInWave,
                totalEnemiesKilled: this.totalEnemiesKilled
            }).then(() => { });
        }
    }
    displayCountdown() {
        if (this.currentCountdown === 1) {
            this.livesLostText.innerHTML = `\n${this.currentCountdown} second remaining.`;
        }
        else {
            this.livesLostText.innerHTML = `\n${this.currentCountdown} seconds remaining.`;
        }
    }
    runCountdown() {
        this._currentCountdown--;
        if (this._currentCountdown == -1) {
            this._currentCountdown = this.countdownStart;
            return false;
        }
    }
    waveStart(enemiesAmount) {
        this._currentWave++;
        if (this.opponentOrMain !== "opponent") {
            this._enemiesKilledInWave = 0;
            this._livesLostInWave = 0;
            this._livesAtStartOfWave = this.player.lives;
            this._totalEnemiesInWave = enemiesAmount;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                enemiesKilledInWave: 0,
                livesLostInWave: 0,
                totalEnemiesInWave: this._totalEnemiesInWave
            }).then(() => { });
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                currentWave: this.currentWave,
                doingWave: true
            });
        }
    }
}
export { GameTracker };
//# sourceMappingURL=gametracker.js.map