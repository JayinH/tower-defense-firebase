import { CanvasManager } from "./canvasmanager.js";
import { Controller } from "./controller.js";
import { Tower } from "./tower.js";

interface GridBlockInfo {
    centerX: number,
    centerY: number,
    hovered: boolean,
    builtTower: boolean,
    tower: Tower | undefined;
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
}

abstract class GridBlock implements GridBlockInfo {
    private _centerX: number = 0;
    private _centerY: number = 0;
    protected _hovered: boolean = false;
    protected _builtTower: boolean = false;
    protected _tower: Tower | undefined;


    constructor(
        protected context: CanvasRenderingContext2D,
        protected _x: number,
        protected _y: number,
        protected _w: number,
        protected _h: number,
        protected _color: string,
    ) {
        this._centerX = this._x + (this._w / 2);
        this._centerY = this._y + (this._h / 2);
    }

    public get w(): number {
        return this._w;
    }

    public get tower(): Tower | undefined {
        return this._tower;
    }

    public get h(): number {
        return this._h;
    }
    public get x(): number {
        return this._x;
    }
    public get y(): number {
        return this._y;
    }
    public get builtTower(): boolean {
        return this._builtTower;
    }

    public get color(): string {
        return this._color;
    }

    public get centerX() {
        return this._centerX;
    }

    public get centerY() {
        return this._centerY;
    }

    public get hovered(): boolean {
        return this._hovered;
    }


    public toggleHovered(): void {
        if (this._hovered) {
            this._hovered = false;
        } else {
            this._hovered = true;
        }
    }

    public addTower(tower: Tower): void {
        if (this._builtTower === undefined) {
            this._builtTower = true;
            this._tower = tower;
        }
    }

    public abstract draw(): void;
}

class GrassBlock extends GridBlock {

    public get builtTower(): boolean {
        return this._builtTower;
    }

    /**
     * If a tower is being hovered over the block, the colour will darken
     * If the tower does not belong on the grass, the hover colour will be red
     * If there is no hover, the colour will remain normal
     */

    draw() {
        if (this._hovered) {
            if (Controller.instance.currentTower === 3) {
                this.context.fillStyle = "rgb(102,0,0)";
            } else {
                this.context.fillStyle = "rgb(25,51,0)";
            }
        } else {
            this.context.fillStyle = this._color;
        }
        this.context.fillRect(this._x, this._y, this._w, this._h);
        if (this._builtTower) {
            (this._tower as Tower).draw();
        }
    }
}

class PathBlock extends GridBlock {
    public static endpointX = 0;
    public static endpointY = 0;
    public static startpointX = 0;
    public static startpointY = 0;
    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        color: string,
        readonly direction: string,
    ) {
        super(context, x, y, w, h, color)
    }
 /**
     * If a tower is being hovered over the block, the colour will darken
     * If the tower does not belong on the path, the hover colour will be red
     * If there is no hover, the colour will remain normal
     */
    draw() {
        if (this._hovered) {
            if (Controller.instance.currentTower === 3) {
                this.context.fillStyle = "rgb(25,51,0)";
            } else {
                this.context.fillStyle = "rgb(102,0,0)";
            }
        } else {
            this.context.fillStyle = this._color;
        }
        this.context.fillRect(this._x, this._y, this._w, this._h);
        if (this._builtTower) {
            (this._tower as Tower).draw();
        }
    }

}

export {PathBlock, GridBlock, GrassBlock}