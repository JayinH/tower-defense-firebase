import { Controller } from "./controller.js";
class GridBlock {
    context;
    _x;
    _y;
    _w;
    _h;
    _color;
    _centerX = 0;
    _centerY = 0;
    _hovered = false;
    _builtTower = false;
    _tower;
    constructor(context, _x, _y, _w, _h, _color) {
        this.context = context;
        this._x = _x;
        this._y = _y;
        this._w = _w;
        this._h = _h;
        this._color = _color;
        this._centerX = this._x + (this._w / 2);
        this._centerY = this._y + (this._h / 2);
    }
    get w() {
        return this._w;
    }
    get tower() {
        return this._tower;
    }
    get h() {
        return this._h;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get builtTower() {
        return this._builtTower;
    }
    get color() {
        return this._color;
    }
    get centerX() {
        return this._centerX;
    }
    get centerY() {
        return this._centerY;
    }
    get hovered() {
        return this._hovered;
    }
    toggleHovered() {
        if (this._hovered) {
            this._hovered = false;
        }
        else {
            this._hovered = true;
        }
    }
    addTower(tower) {
        if (this._builtTower === undefined) {
            this._builtTower = true;
            this._tower = tower;
        }
    }
}
class GrassBlock extends GridBlock {
    get builtTower() {
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
            }
            else {
                this.context.fillStyle = "rgb(25,51,0)";
            }
        }
        else {
            this.context.fillStyle = this._color;
        }
        this.context.fillRect(this._x, this._y, this._w, this._h);
        if (this._builtTower) {
            this._tower.draw();
        }
    }
}
class PathBlock extends GridBlock {
    direction;
    static endpointX = 0;
    static endpointY = 0;
    static startpointX = 0;
    static startpointY = 0;
    constructor(context, x, y, w, h, color, direction) {
        super(context, x, y, w, h, color);
        this.direction = direction;
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
            }
            else {
                this.context.fillStyle = "rgb(102,0,0)";
            }
        }
        else {
            this.context.fillStyle = this._color;
        }
        this.context.fillRect(this._x, this._y, this._w, this._h);
        if (this._builtTower) {
            this._tower.draw();
        }
    }
}
export { PathBlock, GridBlock, GrassBlock };
//# sourceMappingURL=pathclass.js.map