import { StartMenuCommand, HostOrJoinCommand, HostMenuCommand, JoinMenuCommand, JoinHostRoomCommand, LevelSelectionCommand, BeginGameCommand } from "./command.js";
import { Controller } from "./controller.js";
import { Game } from "./game.js";
import { GameCanvas } from "./gamecanvas.js";
import { CompositeMenu, MenuItem } from "./menu.js";
import { Player } from "./player.js";
import { SelectionCanvas } from "./selectionCanvas.js";
class CanvasManager {
    static _instance;
    static GameCanvas = new GameCanvas();
    SelectionCanvas = new SelectionCanvas();
    _player;
    _opponent;
    _connectionInstance;
    _game;
    _opponentId;
    _opponentGame;
    _stage;
    startMenu = new CompositeMenu("Start Game");
    levelSelectMenu = new CompositeMenu("Play");
    hostOrJoinMenu = new CompositeMenu("Join or Host");
    joinMenu = new CompositeMenu("Enter a code");
    hostMenu = new CompositeMenu("Here is the code");
    waitForStartMenu = new CompositeMenu("Wait for host to start the game");
    hostGameLoopMenu = new CompositeMenu("Host game loop");
    gameWrapper = document.querySelector('.game-wrapper');
    _element = document.getElementById("game_screen");
    context = this.element.getContext("2d");
    gameContainer = document.querySelector('.game-container');
    topMenu = document.querySelector(".top-menu");
    opponentTopMenu = document.querySelector(".opponent-top-menu");
    sideMenu = document.querySelector(".side-menu");
    selectionScreen = document.querySelector('.selection-screen-canvas');
    constructor() {
        this.initialize();
    }
    get element() {
        return this._element;
    }
    endGame() {
        this._game = null;
        CanvasManager.GameCanvas.endGame();
    }
    set opponentId(id) {
        this._opponentId = id;
    }
    get opponentId() {
        return this._opponentId;
    }
    setStage(stage) {
        this._stage = stage;
        return this._stage;
    }
    get stage() {
        return this._stage;
    }
    setGame(mapNumber) {
        this._game = new Game();
        console.log(CanvasManager.instance.player);
        this._game.initialize(mapNumber, CanvasManager.instance.player, "main");
        return this._game;
    }
    setOpponentGame(mapNumber) {
        // console.log(CanvasManager.instance.opponent);
        // this._opponentGame = new Game();
        // this._opponentGame.initialize(mapNumber, CanvasManager.instance.opponent, "opponent");
        // this._opponentGame = new Game();
        // this._opponentGame.initialize(mapNumber, CanvasManager.instance.opponent, "opponent");
        // return this._opponentGame;
    }
    get opponentGame() {
        return this._opponentGame;
    }
    setConnectionInstance(id) {
        this._connectionInstance = id;
    }
    get connectionInstance() {
        return this._connectionInstance;
    }
    get game() {
        return this._game;
    }
    setPlayer(nickname) {
        this._player = new Player(nickname);
        return this._player;
    }
    get player() {
        return this._player;
    }
    setOpponent(nickname) {
        this._opponent = new Player(nickname);
    }
    get opponent() {
        return this._opponent;
    }
    initialize() {
        Controller.instance;
        this.composeStartMenu();
        this.startMenu.executeCommand();
    }
    composeStartMenu() {
        // const hostItem = new MenuItem("Host")
        // const joinItem = new MenuItem("Join").addCommand(JoinGameCommand);
        const map1Item = new MenuItem("Map 1");
        map1Item.addCommand(new BeginGameCommand(1));
        const map2Item = new MenuItem("Map 2");
        map2Item.addCommand(new BeginGameCommand(2));
        this.waitForStartMenu.addCommand(new JoinHostRoomCommand(this.waitForStartMenu));
        this.hostMenu.addCommand(new HostMenuCommand(this.hostMenu))
            .addMenuItem(this.levelSelectMenu
            .addCommand(new LevelSelectionCommand(this.levelSelectMenu)));
        // .addCommand(new LevelSelectionCommand(this.levelSelectMenu))
        this.joinMenu.addCommand(new JoinMenuCommand(this.joinMenu)).addMenuItem(this.waitForStartMenu);
        // .addCommand(new JoinHostRoomCommand(this.joinMenu));
        // this.joinMenu.addMenuItem(this.waitForStartMenu);
        this.hostOrJoinMenu.addCommand(new HostOrJoinCommand(this.hostOrJoinMenu));
        this.hostOrJoinMenu.addMenuItem(this.hostMenu).addMenuItem(this.joinMenu);
        this.levelSelectMenu.addMenuItem(map1Item).addMenuItem(map2Item).addMenuItem(this.hostMenu);
        this.waitForStartMenu.addMenuItem(map1Item).addMenuItem(map2Item).addMenuItem(this.hostOrJoinMenu);
        this.startMenu.addCommand(new StartMenuCommand(this.startMenu));
        this.startMenu.addMenuItem(this.hostOrJoinMenu);
    }
    setupGame() {
        this.topMenu.hidden = false;
        this.opponentTopMenu.hidden = false;
        this.sideMenu.hidden = false;
        this.selectionScreen.hidden = false;
        this.gameContainer.hidden = false;
        CanvasManager.GameCanvas.setGame();
        CanvasManager.GameCanvas.setOpponentGame();
        this.SelectionCanvas = new SelectionCanvas();
        this.SelectionCanvas.initialize();
    }
    replay() {
        this.levelSelectMenu.executeCommand();
    }
    static get instance() {
        if (!CanvasManager._instance) {
            CanvasManager._instance = new CanvasManager();
        }
        return CanvasManager._instance;
    }
}
export { CanvasManager };
//# sourceMappingURL=canvasmanager.js.map