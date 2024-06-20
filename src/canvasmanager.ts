import { StartMenuCommand, HostOrJoinCommand, HostMenuCommand, JoinMenuCommand, JoinHostRoomCommand, LevelSelectionCommand, BeginGameCommand } from "./command.js"
import { Controller } from "./controller.js";
import { Game } from "./game.js";
import { GameCanvas } from "./gamecanvas.js";
import { CompositeMenu, MenuItem } from "./menu.js";
import { Player } from "./player.js";
import { SelectionCanvas } from "./selectionCanvas.js";

class CanvasManager {
    private static _instance: CanvasManager;
    public static GameCanvas: GameCanvas = new GameCanvas();
    public SelectionCanvas: SelectionCanvas = new SelectionCanvas();
    private _player: Player;
    private _opponent: Player;
    private _connectionInstance: string;
    private _game: Game;
    private _opponentId: string;
    private _opponentGame: Game;
    private _stage: string;
    private startMenu: CompositeMenu = new CompositeMenu("Start Game");
    private levelSelectMenu: CompositeMenu = new CompositeMenu("Play");
    private hostOrJoinMenu: CompositeMenu = new CompositeMenu("Join or Host");
    private joinMenu: CompositeMenu = new CompositeMenu("Enter a code")
    private hostMenu: CompositeMenu = new CompositeMenu("Here is the code");
    private waitForStartMenu: CompositeMenu = new CompositeMenu("Wait for host to start the game");

    private _element: HTMLCanvasElement = document.getElementById(
        "game_screen"
    ) as HTMLCanvasElement;
    public context = this.element.getContext("2d") as CanvasRenderingContext2D;
    private gameContainer = document.querySelector('.game-container') as HTMLDivElement;
    private topMenu = document.querySelector(".top-menu") as HTMLDivElement;
    private opponentTopMenu = document.querySelector(".opponent-top-menu") as HTMLDivElement;
    private sideMenu = document.querySelector(".side-menu") as HTMLDivElement;
    private selectionScreen = document.querySelector('.selection-screen-canvas') as HTMLDivElement;
    private constructor() {
        this.initialize();
    }
    public get element(): HTMLCanvasElement {
        return this._element;
    }
    public endGame() {
        this._game = null;
        CanvasManager.GameCanvas.endGame();
    }

    public set opponentId(id: string) {
        this._opponentId = id;
    }

    public get opponentId() {
        return this._opponentId
    }

    public setStage(stage: string) {
        this._stage = stage;
        return this._stage;
    }

    public get stage() {
        return this._stage;
    }

    public setGame(mapNumber: number) {
        this._game = new Game();
        this._game.initialize(mapNumber, CanvasManager.instance.player, CanvasManager.instance.connectionInstance);
        return this._game;
    }

    public get opponentGame() {
        return this._opponentGame;
    }

    public setConnectionInstance(id: string) {
        this._connectionInstance = id;
    }

    public get connectionInstance() {
        return this._connectionInstance;
    }

    public get game() {
        return this._game;
    }

    public setPlayer(nickname: string) {
        this._player = new Player(nickname);
        return this._player;
    }

    public get player() {
        return this._player;
    }

    public setOpponent(nickname: string) {
        this._opponent = new Player(nickname)
    }

    public get opponent() {
        return this._opponent;
    }

    public initialize() {
        Controller.instance;
        this.composeAllMenus();
        this.startMenu.executeCommand();
    }

    /**
     * All menus are composed with respective menu items/commands
     */
    private composeAllMenus(): void {
        const map1Item = new MenuItem("Map 1");
        map1Item.addCommand(new BeginGameCommand(1));
        const map2Item = new MenuItem("Map 2");
        map2Item.addCommand(new BeginGameCommand(2));
        this.waitForStartMenu.addCommand(new JoinHostRoomCommand(this.waitForStartMenu));

        this.hostMenu.addCommand(new HostMenuCommand(this.hostMenu))
            .addMenuItem(this.levelSelectMenu
                .addCommand
                (new LevelSelectionCommand(this.levelSelectMenu)))
        this.joinMenu.addCommand(new JoinMenuCommand(this.joinMenu)).addMenuItem(this.waitForStartMenu);
        this.hostOrJoinMenu.addCommand(new HostOrJoinCommand(this.hostOrJoinMenu));
        this.hostOrJoinMenu.addMenuItem(this.hostMenu).addMenuItem(this.joinMenu);
        this.levelSelectMenu.addMenuItem(map1Item).addMenuItem(map2Item).addMenuItem(this.hostMenu);
        this.waitForStartMenu.addMenuItem(map1Item).addMenuItem(map2Item).addMenuItem(this.hostOrJoinMenu);
        this.startMenu.addCommand(
            new StartMenuCommand(this.startMenu)
        )
        this.startMenu.addMenuItem(this.hostOrJoinMenu);
    }

    public setupGame() {
        this.topMenu.hidden = false;
        this.opponentTopMenu.hidden = false;
        this.sideMenu.hidden = false;
        this.selectionScreen.hidden = false;
        this.gameContainer.hidden = false;
        CanvasManager.GameCanvas.setGame();
        this.SelectionCanvas = new SelectionCanvas();
        this.SelectionCanvas.initialize();
    }

    public replayHost() {
        this.levelSelectMenu.executeCommand();
    }

    public replayOpponent() {
        this.waitForStartMenu.executeCommand();
    }

    public static get instance(): CanvasManager {
        if (!CanvasManager._instance) {
            CanvasManager._instance = new CanvasManager();
        }
        return CanvasManager._instance;
    }
}

export { CanvasManager }