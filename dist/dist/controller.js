import { CanvasManager } from "./canvasmanager.js";
import { PlantTower, TowerSelectionCommand, towerMoveSelection } from "./command.js";
import { GameCanvas } from "./gamecanvas.js";
import { Player } from "./player.js";
import { TowerDrawing } from "./towerDrawing.js";
class Controller {
    mouseX = 0;
    mouseY = 0;
    static _instance;
    _selection = false;
    _overSelection = false;
    _hover = true;
    _currentTower = 1;
    _overDirectionTower = false;
    direction;
    aim = false;
    xPos;
    yPos;
    context;
    clickListener;
    selectedTower = null;
    clickTowerListener;
    grassBlocks;
    pathBlocks;
    towerManager;
    player = new Player("john");
    towerModificationsManager;
    constructor() {
        document.addEventListener("mousemove", (event) => this.updateMousePosition(event));
        this.clickListener = () => this.handleMouseClick1();
        document.addEventListener("click", this.clickListener);
        this.clickTowerListener = () => this.clickTower();
        document.addEventListener("click", this.clickTowerListener);
    }
    setInfo(towerManager, player, towerModificationsManager) {
        this.context = CanvasManager.instance.element.getContext("2d");
        this.towerManager = towerManager;
        this.player = player;
        this.towerModificationsManager = towerModificationsManager;
    }
    setBlocks(grassBlocks, pathBlock) {
        this.grassBlocks = grassBlocks;
        this.pathBlocks = pathBlock;
    }
    get overDirectionTower() {
        return this._overDirectionTower;
    }
    toggleAim() {
        if (this.aim) {
            this.aim = false;
        }
        else {
            this.aim = true;
        }
    }
    toggleSelection() {
        if (this._selection) {
            this._selection = false;
        }
        else {
            this._selection = true;
        }
    }
    toggleOverHover() {
        if (this._overSelection) {
            this._overSelection = false;
        }
        else {
            this._overSelection = true;
        }
    }
    toggleOverDirectionTower() {
        if (this._overDirectionTower) {
            this._overDirectionTower = false;
        }
        else {
            this._overDirectionTower = true;
        }
    }
    toggleHover() {
        if (this._hover) {
            this._hover = false;
        }
        else {
            this._hover = true;
        }
    }
    get overSelection() {
        return this._overSelection;
    }
    set currentTower(val) {
        const totalTowers = 4;
        if (val <= totalTowers) {
            this._currentTower = val;
        }
    }
    get currentTower() {
        return this._currentTower;
    }
    updateMousePosition(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }
    getCursorPosition() {
        const boundingRect = CanvasManager.GameCanvas.element.getBoundingClientRect();
        const canvasX = boundingRect.x;
        const canvasY = boundingRect.y;
        const mousePositionX = this.mouseX - canvasX;
        const mousePositionY = this.mouseY - canvasY;
        return { x: mousePositionX, y: mousePositionY };
    }
    handleMouse(command) {
        const { x, y } = this.getCursorPosition();
        command.execute(x, y);
    }
    inputHandler() {
        if (this._selection) {
            this.handleMouse(new towerMoveSelection(this.grassBlocks, this.pathBlocks));
        }
        if (this._hover) {
            this.handleMouse(new TowerSelectionCommand(this.player, this.grassBlocks, this.pathBlocks));
        }
        if (this.aim) {
            const { x, y } = this.getCursorPosition();
            this.handleMouseDirection(x, y);
            TowerDrawing.drawCharacter2(this.context, Math.floor(this.xPos / 50) * 50, Math.floor(this.yPos / 50) * 50, 0.5);
            TowerDrawing.drawCharacter2Aim(this.context, Math.floor(this.xPos / 50) * 50, Math.floor(this.yPos / 50) * 50, this.direction, 0.5);
        }
    }
    /**
     * Handles the mouse click event when the mouse is over a selection.
     * Toggles the hover state, over hover state, and selection state.
     * If the mouse is over a direction tower, updates the click listener to handle direction tower clicks.
     * Otherwise, updates the click listener to handle other mouse clicks and the mouses style.
     */
    handleMouseClick1() {
        if (this._overSelection) {
            this.toggleHover();
            this.toggleOverHover();
            this.toggleSelection();
            if (this._overDirectionTower) {
                document.removeEventListener("click", this.clickListener);
                this.clickListener = () => this.handleDirectionTowerMouseClick();
                document.addEventListener("click", this.clickListener);
                this.toggleOverDirectionTower();
            }
            else {
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
    handleDirectionTowerMouseClick() {
        const { x, y } = this.getCursorPosition();
        if (x < GameCanvas.WIDTH && y < GameCanvas.HEIGHT && y >= 0) {
            this.toggleSelection();
            this.toggleAim();
            document.removeEventListener("click", this.clickListener);
            this.xPos = x;
            this.yPos = y;
            this.clickListener = (event) => this.handleMouseClick2(event);
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
    handleMouseDirection(x, y) {
        const newYPos = Math.floor(this.yPos / 50) * 50;
        const newXPos = Math.floor(this.xPos / 50) * 50;
        if (x <= GameCanvas.WIDTH && y <= GameCanvas.HEIGHT && y >= 0) {
            if (x <= (newXPos)) {
                this.direction = "left";
            }
            else if (x > (newXPos) && x <= (newXPos + 50)) {
                if (y <= newYPos) {
                    this.direction = "up";
                }
                else {
                    this.direction = "down";
                }
            }
            else {
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
    handleMouseClick2(event) {
        const { x, y } = this.getCursorPosition();
        if (x <= GameCanvas.WIDTH && y <= GameCanvas.HEIGHT && y >= 0) {
            const plantTower = new PlantTower(this.towerManager, this.player, this.pathBlocks, this.grassBlocks, this.direction);
            if (this.aim) {
                this.toggleAim();
                plantTower.execute(this.xPos, this.yPos);
            }
            else {
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
    clickTower() {
        const { x, y } = this.getCursorPosition();
        let towerClicked = false;
        try {
            for (let i = 0; i < this.towerManager.towers.length; i++) {
                const curTower = this.towerManager.towers[i];
                if (curTower.x <= x && curTower.x + curTower.w >= x && curTower.y <= y && curTower.y + curTower.h >= y) {
                    this.selectedTower = this.towerManager.towers[i];
                    this.towerModificationsManager.setTower(this.selectedTower, i);
                    towerClicked = true;
                }
            }
            if (!towerClicked) {
                this.selectedTower = null;
                this.towerModificationsManager.defaultMenu();
            }
        }
        catch { }
    }
    static get instance() {
        if (!Controller._instance) {
            Controller._instance = new Controller();
        }
        return Controller._instance;
    }
}
export { Controller };
//# sourceMappingURL=controller.js.map