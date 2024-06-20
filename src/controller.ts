import { CanvasManager } from "./canvasmanager.js";
import { PlantTower, TowerSelectionCommand, towerMoveSelection } from "./command.js";
import { GameCanvas } from "./gamecanvas.js";
import { GrassBlock, PathBlock } from "./pathclass.js";
import { Player } from "./player.js";
import { Tower } from "./tower.js";
import { TowerDrawing } from "./towerDrawing.js";
import { TowerManager } from "./towerManager.js";
import { TowerModificationsManager } from "./towerModifications.js";

class Controller {
    private mouseX: number = 0;
    private mouseY: number = 0;
    private static _instance: Controller;
    private _selection: boolean = false;
    private _overSelection: boolean = false;
    private _hover: boolean = true;
    private _currentTower: number = 1;
    private _overDirectionTower: boolean = false;
    private direction: string | undefined;
    private aim: boolean = false;
    private xPos: number | undefined;
    private yPos: number | undefined;
    private context: CanvasRenderingContext2D;
    private clickListener: (event: MouseEvent) => void;
    private selectedTower: Tower | null = null;
    private clickTowerListener: ((event: MouseEvent) => void) | undefined;
    private grassBlocks: GrassBlock[] | undefined;
    private pathBlocks: PathBlock[] | undefined;
    private towerManager: TowerManager;
    private player: Player = new Player("john");
    private towerModificationsManager: TowerModificationsManager;
    constructor() {
        document.addEventListener("mousemove", (event) => this.updateMousePosition(event));
        this.clickListener = () => this.handleMouseClick1();
        document.addEventListener("click", this.clickListener);
        this.clickTowerListener = () => this.clickTower();
        document.addEventListener("click", this.clickTowerListener);
    }

    public setInfo(towerManager: TowerManager, player: Player, towerModificationsManager: TowerModificationsManager) {
        this.context = CanvasManager.instance.element.getContext("2d") as CanvasRenderingContext2D
        this.towerManager = towerManager;
        this.player = player;
        this.towerModificationsManager = towerModificationsManager;
    }

    public setBlocks(grassBlocks: GrassBlock[], pathBlock: PathBlock[]): void {
        this.grassBlocks = grassBlocks;
        this.pathBlocks = pathBlock;
    }

    public get overDirectionTower(): boolean {
        return this._overDirectionTower;
    }

    public toggleAim() {
        if (this.aim) {
            this.aim = false;
        } else {
            this.aim = true;
        }
    }

    public toggleSelection() {
        if (this._selection) {
            this._selection = false;
        } else {
            this._selection = true;
        }
    }

    public toggleOverHover() {
        if (this._overSelection) {
            this._overSelection = false;
        } else {
            this._overSelection = true;
        }
    }

    public toggleOverDirectionTower() {
        if (this._overDirectionTower) {
            this._overDirectionTower = false;
        } else {
            this._overDirectionTower = true;
        }
    }

    public toggleHover() {
        if (this._hover) {
            this._hover = false;
        } else {
            this._hover = true;
        }
    }

    public get overSelection(): boolean {
        return this._overSelection;
    }

    public set currentTower(val: number) {
        const totalTowers: number = 4;
        if (val <= totalTowers) {
            this._currentTower = val;
        }
    }

    public get currentTower(): number {
        return this._currentTower;
    }

    private updateMousePosition(event: MouseEvent): void {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }

    private getCursorPosition() {
        const boundingRect = CanvasManager.GameCanvas.element.getBoundingClientRect();
        const canvasX = boundingRect.x;
        const canvasY = boundingRect.y;

        const mousePositionX = this.mouseX - canvasX;
        const mousePositionY = this.mouseY - canvasY;

        return { x: mousePositionX, y: mousePositionY };
    }

    private handleMouse(command: any) {
        const { x, y } = this.getCursorPosition();
        command.execute(x, y);
    }

    public inputHandler() {
        if (this._selection) {
            this.handleMouse(new towerMoveSelection(this.grassBlocks as GrassBlock[], this.pathBlocks as PathBlock[]));
        }
        if (this._hover) {
            this.handleMouse(new TowerSelectionCommand(this.player, this.grassBlocks as GrassBlock[], this.pathBlocks as PathBlock[]));
        }


        if (this.aim) {
            const { x, y } = this.getCursorPosition();
            this.handleMouseDirection(x, y);
            TowerDrawing.drawCharacter2(this.context, Math.floor(this.xPos as number / 50) * 50, Math.floor(this.yPos as number / 50) * 50, 0.5);
            TowerDrawing.drawCharacter2Aim(this.context, Math.floor(this.xPos as number / 50) * 50, Math.floor(this.yPos as number / 50) * 50, this.direction as string, 0.5);
        }
    }

    /**
     * Handles the mouse click event when the mouse is over a selection.
     * Toggles the hover state, over hover state, and selection state.
     * If the mouse is over a direction tower, updates the click listener to handle direction tower clicks.
     * Otherwise, updates the click listener to handle other mouse clicks and the mouses style.
     */

    private handleMouseClick1(): void {
        if (this._overSelection) {
            this.toggleHover();
            this.toggleOverHover();
            this.toggleSelection();
            if (this._overDirectionTower) {
                document.removeEventListener("click", this.clickListener);
                this.clickListener = () => this.handleDirectionTowerMouseClick();
                document.addEventListener("click", this.clickListener);
                this.toggleOverDirectionTower();
            } else {
                document.removeEventListener("click", this.clickListener);
                this.clickListener = () => this.handleMouseClick2();
                document.addEventListener("click", this.clickListener);

            }
            //update mouse
            document.body.style.cursor = "default";
        }
    }
    //placing the tower onto the grid

    /**
     * Handles the mouse click event when the mouse is over a direction tower.
     * Gets the cursor position and checks if it is within the canvas boundaries.
     * If so, toggles the selection and aim states, updates the cursor position,
     * and updates the click listener to handle the next mouseclick.
     */

    private handleDirectionTowerMouseClick() {
        const { x, y } = this.getCursorPosition();
        if (x < GameCanvas.WIDTH && y < GameCanvas.HEIGHT && y >= 0) {
            this.toggleSelection();
            this.toggleAim();
            document.removeEventListener("click", this.clickListener);
            this.xPos = x;
            this.yPos = y;
            this.clickListener = (event: MouseEvent) => this.handleMouseClick2(event);
            document.addEventListener("click", this.clickListener);
        }
    }
    /**
         * Determines the direction of the mouse based on its position relative to the object's position.
         * Calculates the new X and Y positions rounded to the nearest map block.
         * Sets the direction based on the mouse's position within the canvas 
         * boundaries to "left", "up", "down" or right based on its X and Y position.
         *
         * @param {number} x The X coordinate of the mouse position.
         * @param {number} y The Y coordinate of the mouse position.
         */
    private handleMouseDirection(x: number, y: number) {
        const newYPos: number = Math.floor((this.yPos as number) / 50) * 50;
        const newXPos: number = Math.floor((this.xPos as number) / 50) * 50;

        if (x <= GameCanvas.WIDTH && y <= GameCanvas.HEIGHT && y >= 0) {
            if (x <= (newXPos)) {
                this.direction = "left";
            } else if (x > (newXPos) && x <= (newXPos + 50)) {
                if (y <= newYPos) {
                    this.direction = "up";
                } else {
                    this.direction = "down";
                }
            } else {
                this.direction = "right";
            }
        }
    }

    /**
     * Handles the second mouse click event by getting the cursor position and checking
     * if it is within the canvas boundaries. If so, creates a new PlantTower
     * and executes its action. If aiming, toggles the aim state or toggles the selection state.
     * Updates the click listener to handle the first mouse click and toggles the hover state.
     */

    private handleMouseClick2(event?: MouseEvent): void {

        const { x, y } = this.getCursorPosition();
        if (x <= GameCanvas.WIDTH && y <= GameCanvas.HEIGHT && y >= 0) {
            const plantTower: PlantTower = new PlantTower(this.towerManager, this.player, this.pathBlocks as PathBlock[], this.grassBlocks as GrassBlock[], this.direction);
            if (this.aim) {
                this.toggleAim();
                plantTower.execute(this.xPos as number, this.yPos as number);
            } else {
                plantTower.execute(x, y);
                this.toggleSelection();
            }
            document.removeEventListener("click", this.clickListener);
            this.clickListener = () => this.handleMouseClick1();
            document.addEventListener("click", this.clickListener);
            this.toggleHover();
        }
    }

    /**
     * Handles the click event on a tower.
     * Gets the cursor position and checks if it intersects with any existing towers.
     * If a tower is clicked, sets it as the selected tower and updates the tower upgrades menu.
     * If no tower is clicked, deselects the current tower and resets the tower upgrades menu to default.
     */

    private clickTower(): void {
        const { x, y } = this.getCursorPosition();
        let towerClicked = false;
        try {
            for (let i = 0; i < this.towerManager.towers.length; i++) {
                const curTower: Tower = this.towerManager.towers[i];
                if (curTower.x <= x && curTower.x + curTower.w >= x && curTower.y <= y && curTower.y + curTower.h >= y) {
                    this.selectedTower = this.towerManager.towers[i];
                    this.towerModificationsManager.setTower(this.selectedTower, i)
                    towerClicked = true;
                }
            }
            if (!towerClicked) {
                this.selectedTower = null;
                this.towerModificationsManager.defaultMenu();
            }
        } catch {}
       
    }

    public static get instance(): Controller {
        if (!Controller._instance) {
            Controller._instance = new Controller();
        }
        return Controller._instance;
    }
}

export { Controller }