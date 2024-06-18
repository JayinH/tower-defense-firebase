import { CanvasManager } from "./canvasmanager.js";
import { get, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
class GameCanvas {
    _element = document.getElementById("game_screen");
    _opponentScreen = document.getElementById("opponent_screen");
    gameWrapper = document.querySelector('.game-wrapper');
    mainContext = this.element.getContext("2d");
    opponentContext = this._opponentScreen.getContext("2d");
    static WIDTH = 600;
    static HEIGHT = 450;
    _game;
    _opponentGame;
    gameContainer = document.querySelector('.game-container');
    topMenu = document.querySelector(".top-menu");
    sideMenu = document.querySelector(".side-menu");
    selectionScreen = document.querySelector('.selection-screen-canvas');
    constructor() {
        this._element.width = GameCanvas.WIDTH;
        this._element.height = GameCanvas.HEIGHT;
        this._opponentScreen.width = GameCanvas.WIDTH;
        this._opponentScreen.height = GameCanvas.HEIGHT;
    }
    get game() {
        return this._game;
    }
    endGame() {
        this._game = null;
    }
    async setOpponentGame() {
        // console.log(CanvasManager.instance.opponent)
        this._opponentGame = CanvasManager.instance.opponentGame;
        // this._opponentGame.mainLoop();
    }
    async setGame() {
        console.log('setup!!!!!!');
        this.sideMenu.style.display = "block";
        this.topMenu.hidden = false;
        this.gameWrapper.hidden = false;
        this._game = CanvasManager.instance.game;
        // this._game = new Game(mapNumber);
        const wOrL = document.querySelector('.w-or-l');
        const finalEnemiesKilled = document.querySelector('.final-enemies-killed');
        const wavesCompleted = document.querySelector('.waves-completed');
        const opponentFinalEnemiesKilled = document.querySelector('.opponent-final-enemies-killed');
        const opponentWavesCompleted = document.querySelector('.opponent-waves-completed');
        // const points = document.querySelector('.points') as HTMLDivElement;
        const gameInfo = await this._game.mainLoop();
        const otherPlayerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.opponentId}`);
        const otherPlayerSnapshot = await get(otherPlayerRef);
        const otherPlayerData = otherPlayerSnapshot.val();
        const myPlayerRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}`);
        const myPlayerSnapshot = await get(myPlayerRef);
        const myPlayerData = myPlayerSnapshot.val();
        // console.log(otherPlayerData)
        // console.log(CanvasManager.instance.player.won)
        // console.log(otherPlayerData.won)
        // console.log(CanvasManager.instance.player.lost)
        // console.log(otherPlayerData.lost)
        if (myPlayerData.won === otherPlayerData.won && myPlayerData.lost === otherPlayerData.lost) {
            wOrL.innerHTML = `Draw`;
            finalEnemiesKilled.innerHTML = `Total Enemies Killed: ${gameInfo[1]}`;
            wavesCompleted.innerHTML = `Waves Completed: ${gameInfo[2]}`;
            // points.innerHTML = `Score: ${gameInfo[3]}`;
            opponentFinalEnemiesKilled.innerHTML = `Opponent Enemies Killed: ${otherPlayerData.enemiesKilled}`;
            opponentWavesCompleted.innerHTML = `Opponent Completed: ${otherPlayerData.wavesCompleted}`;
        }
        else {
            wOrL.innerHTML = `${gameInfo[0]}`;
            finalEnemiesKilled.innerHTML = `Total Enemies Killed: ${gameInfo[1]}`;
            wavesCompleted.innerHTML = `Waves Completed: ${gameInfo[2]}`;
            opponentFinalEnemiesKilled.innerHTML = `Opponent Enemies Killed: ${otherPlayerData.enemiesKilled}`;
            opponentWavesCompleted.innerHTML = `Opponent Completed: ${otherPlayerData.wavesCompleted}`;
            // points.innerHTML = `Score: ${gameInfo[3]}`;
        }
        this._game = null;
        this.gameWrapper.hidden = true;
        const playAgainScreen = document.querySelector('#playAgain');
        playAgainScreen.hidden = false;
        const gameOverButton = document.querySelector('#playAgainButton');
        gameOverButton.addEventListener('click', e => {
            playAgainScreen.hidden = true;
            this.gameWrapper.hidden = false;
            this.gameContainer.hidden = true;
            this.topMenu.hidden = true;
            this.sideMenu.hidden = true;
            this.selectionScreen.hidden = true;
            CanvasManager.instance.replay();
        });
    }
    get element() {
        return this._element;
    }
    get opponentScreen() {
        return this._opponentScreen;
    }
}
export { GameCanvas };
//# sourceMappingURL=gamecanvas.js.map