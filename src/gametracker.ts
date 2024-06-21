import { CanvasManager } from "./canvasmanager.js";
import { Player } from "./player.js";
import {
    set,
    onDisconnect,
    onValue,
    push,
    remove,
    update,
    onChildAdded,
    onChildRemoved,
    ref,
    get
    //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";

interface GameTrackerInfo {
    currentWave: number,
    enemiesKilledInWave: number,
    totalEnemiesInWave: number,
    totalEnemiesKilled: number,
    livesLostInWave: number,
    totalLivesLost: number,
    countdownStart: number,
    currentCountdown: number,
    countdownInterval: number,
    countdownCounter: number
}

interface GameTrackerMethods {
    resetCoundtownCounter(): void,
    increaseCountdownCounter(): void,
    loseLife(): void,
    manage(): void,
    displayMoney(): void,
    manageInBetweenWaves(): void,
    enemyKilled(): void,
    displayCountdown(): void,
    runCountdown(): void | boolean,
    waveStart(enemiesAmount: number): void,

}

class GameTracker implements GameTrackerInfo, GameTrackerMethods {
    private _currentWave: number = 0;
    private _enemiesKilledInWave: number = 0;
    private _totalEnemiesInWave: number = 0;
    private _totalEnemiesKilled = 0;
    private _livesLostInWave: number = 0;
    private _totalLivesLost: number = 0;
    private _countdownStart: number = 10;
    private _currentCountdown: number = 10;

    readonly countdownInterval: number = 1000;
    private _countdownCounter: number = 0;
    private _topMenu = document.querySelector('.top-menu') as HTMLDivElement;
    private _livesText = this._topMenu.querySelector('.lives') as HTMLDivElement;
    private _moneyText = this._topMenu.querySelector('.money') as HTMLDivElement;
    private _waveText = this._topMenu.querySelector('.wave') as HTMLDivElement;
    private _enemiesKilledText = this._topMenu.querySelector('.enemies-killed') as HTMLDivElement;
    private _livesLostText = this._topMenu.querySelector('.lives-lost') as HTMLDivElement;

    private _livesAtStartOfWave: number = 50;

    constructor(
        private player: Player,
        private gameInstance: string,
        private opponentOrMain?: string
    ) {
        if (opponentOrMain === "opponent") {
            this._topMenu = document.querySelector('.opponent-top-menu') as HTMLDivElement;
            this._livesText = this._topMenu.querySelector('.lives') as HTMLDivElement;
            this._moneyText = this._topMenu.querySelector('.money') as HTMLDivElement;
            this._waveText = this._topMenu.querySelector('.wave') as HTMLDivElement;
            this._enemiesKilledText = this._topMenu.querySelector('.enemies-killed') as HTMLDivElement;
            this._livesLostText = this._topMenu.querySelector('.lives-lost') as HTMLDivElement;
        }
        this._livesAtStartOfWave = player.lives;
    }

    // Getters for private variables
    get currentWave(): number {
        return this._currentWave;
    }

    get enemiesKilledInWave(): number {
        return this._enemiesKilledInWave;
    }

    get totalEnemiesInWave(): number {
        return this._totalEnemiesInWave;
    }

    get totalEnemiesKilled(): number {
        return this._totalEnemiesKilled;
    }

    get livesLostInWave(): number {
        return this._livesLostInWave;
    }

    get totalLivesLost(): number {
        return this._totalLivesLost;
    }

    get countdownStart(): number {
        return this._countdownStart;
    }

    get currentCountdown(): number {
        return this._currentCountdown;
    }

    get countdownCounter(): number {
        return this._countdownCounter;
    }

    get livesText(): HTMLDivElement {
        return this._livesText;
    }

    get moneyText(): HTMLDivElement {
        return this._moneyText;
    }

    get waveText(): HTMLDivElement {
        return this._waveText;
    }

    get enemiesKilledText(): HTMLDivElement {
        return this._enemiesKilledText;
    }

    get livesLostText(): HTMLDivElement {
        return this._livesLostText;
    }

    public resetCoundtownCounter(): void {
        this._countdownCounter = 0;
    }

    public increaseCountdownCounter(): void {
        this._countdownCounter++;
    }

    /**
     * The database is updated when a player loses a life
     */
    public loseLife(): void {
        if (this.opponentOrMain !== "opponent") {
            this._livesLostInWave++;
            this._totalLivesLost++;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                livesLostInWave: this._livesLostInWave,
                totalLivesLost: this._totalLivesLost
            }).then(() => { })
        }
    }

    /**
     * Updates the screen with all of the following information during waves
     * The split screen data replicates that of the main screen
     */
    public manage(): void {
        if(this.opponentOrMain === "opponent") {
            const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
            get(otherPlayerRef)
                .then((otherPlayerSnapshot) => {
                    const otherPlayerData = otherPlayerSnapshot.val();
                    this._livesLostInWave = otherPlayerData.livesLostInWave;
                    this._totalLivesLost = otherPlayerData.totalLivesLost;
                    this._totalEnemiesKilled = otherPlayerData.totalEnemiesKilled;
                    this._enemiesKilledInWave = otherPlayerData.enemiesKilledInWave;
                    this._totalEnemiesInWave = otherPlayerData.totalEnemiesInWave;
                })
        }
       
        this.displayMoney();
        this.displayCurrentWave();
        this.displayLives();
        this.displayEnemiesInWaveInfo();
        this.displayLivesLostInWaves();

    }

    public displayMoney(): void {
        this.moneyText.innerHTML = `Money: $${this.player.money}`;
    }

    /**
     * Updates the screen with all of the following information in between waves
     * The split screen data relicates the main screen
     */

    public manageInBetweenWaves(): void {
        if(this.opponentOrMain === "opponent") {
            const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}`);
        
            get(otherPlayerRef)
                .then((otherPlayerSnapshot) => {
                    const otherPlayerData = otherPlayerSnapshot.val();
                    this._livesLostInWave = otherPlayerData.livesLostInWave;
                    this._totalLivesLost = otherPlayerData.totalLivesLost;
                    
                    if(otherPlayerData.totalEnemiesKilled) {
                        this._totalEnemiesKilled = otherPlayerData.totalEnemiesKilled;
                    } else {
                        this._totalEnemiesKilled = 0;
                    }
                    this._enemiesKilledInWave = otherPlayerData.enemiesKilledInWave;
                    this._totalEnemiesInWave = otherPlayerData.totalEnemiesInWave;
                })
        }
        this.displayMoney();
        this.displayNextWave();
        this.displayLives();
        this.displayTotalEnemiesKilledInfo();
        this.displayCountdown();
    }

    private displayCurrentWave(): void {
        this.waveText.innerHTML = `\nCurrent Wave: ${this.currentWave}`;

    }

    public set totalEnemiesInWave(enemiesAmount: number) {
        this._totalEnemiesInWave = enemiesAmount;
    }

    private displayLives(): void {
        this.livesText.innerHTML = `\nLives: ${this.player.lives}`;
    }


    private displayNextWave(): void {
        this.waveText.innerHTML = `\nPreparing to start Wave ${this.currentWave + 1}`;

    }

    private displayTotalEnemiesKilledInfo(): void {
        this.enemiesKilledText.innerHTML = `\nTotal Enemies killed: ${this.totalEnemiesKilled}`;

    }

    private displayEnemiesInWaveInfo(): void {
        this.enemiesKilledText.innerHTML = `\nEnemies killed in wave: ${this._enemiesKilledInWave}/${this._totalEnemiesInWave}`;

    }

    public increaseEnemiesInWave(): void {
        if(this.opponentOrMain !== "opponent") {
            this._totalEnemiesInWave++;
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                totalEnemiesInWave: this._totalEnemiesInWave
            }).then(() => { })
        }   
    }

    private displayLivesLostInWaves(): void {
        this.livesLostText.innerHTML = `\nLives lost in wave: ${this._livesAtStartOfWave - this.player.lives}`;
    }

    public enemyKilled() {
        if (this.opponentOrMain !== "opponent") {
            this._totalEnemiesKilled++;
            this._enemiesKilledInWave++;

            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                enemiesKilledInWave: this.enemiesKilledInWave,
                totalEnemiesKilled: this.totalEnemiesKilled
            }).then(() => { })
        }
    }

    public displayCountdown() {
        if (this.currentCountdown === 1) {
            this.livesLostText.innerHTML = `\n${this.currentCountdown} second remaining.`;
        } else {
            this.livesLostText.innerHTML = `\n${this.currentCountdown} seconds remaining.`;
        }
    }

    public runCountdown(): void | boolean {

        this._currentCountdown--;
        if (this._currentCountdown == -1) {
            this._currentCountdown = this.countdownStart;
            return false;
        }
    }

    /**
     * 
     * @param enemiesAmount - number of enemies in the wave
     */
    public waveStart(enemiesAmount: number): void {
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
            }).then(() => { })
            
            update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}`), {
                currentWave: this.currentWave,
                doingWave: true
                
            });
        }
    }
}

export { GameTracker }