import { CanvasManager } from "./canvasmanager.js";

interface HealthBarInfo {
    width: number,
    height: number,
    active: boolean,
    barColor: string,
    barHeight: number,
    maxBarWidth: number,
    barWidth: number,
    x: number,
    y: number

}

class HealthBar implements HealthBarInfo {
    readonly width: number = 40;
    readonly height: number = 5;
    private _active: boolean = true;

    private _barColor: string = "green";
    readonly barHeight: number = 3;
    readonly maxBarWidth: number = this.width - 2
    private _barWidth: number = this.width - 2;

    constructor(
        private context: CanvasRenderingContext2D,
        private _x: number,
        private _y: number,
    ) {
        this._barColor = this.getRGBFromPercent(100);
    }

    public get x(): number {
        return this._x;
    }

    public get active(): boolean {
        return this._active;
    }

    public get y(): number {
        return this._y;
    }

    public get barColor(): string {
        return this._barColor;
    }

    public get barWidth(): number {
        return this._barWidth;
    }

    public updatePos(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public inactivate() {
        this._x = 700;
        this._y = 500;
        this._active = false;
    }

    //code taken from chat gpt

    /**
     * 
     * returns a colour based on a percent of amount health left, ranging from green to red
     */

    public getRGBFromPercent(percent: number): string {
        // Ensure percent is within the bounds of 0 to 100
        percent = Math.max(0, Math.min(100, percent));

        // Calculate the red and green components
        let red, green;

        if (percent < 50) {
            // From 0 to 50%, we move from red to yellow
            red = 255;
            green = Math.round(255 * (percent / 50));
        } else {
            // From 50 to 100%, we move from yellow to green
            green = 255;
            red = Math.round(255 * ((50 - (percent - 50)) / 50));
        }

        // The blue component is always 0
        const blue = 0;

        // Return the RGB color as a string
        return `rgb(${red}, ${green}, ${blue})`;
    }

    public update(percent: number) {
        this._barColor = this.getRGBFromPercent(percent);

        this._barWidth = percent / 100 * this.maxBarWidth;
    }

    public draw() {
        const context = this.context;
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(this._x, this._y, this.width, this.height);
        context.fillStyle = "grey";
        context.fillRect(this._x + 1 + this._barWidth, this._y + 1, 1, this.barHeight);
        context.fillStyle = this.barColor
        context.fillRect(this._x + 1, this._y + 1, this._barWidth, this.barHeight);
    }
}

export {HealthBar}