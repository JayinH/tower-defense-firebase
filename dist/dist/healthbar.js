class HealthBar {
    context;
    _x;
    _y;
    width = 40;
    height = 5;
    _active = true;
    _barColor = "green";
    barHeight = 3;
    maxBarWidth = this.width - 2;
    _barWidth = this.width - 2;
    constructor(context, _x, _y) {
        this.context = context;
        this._x = _x;
        this._y = _y;
        this._barColor = this.getRGBFromPercent(100);
    }
    get x() {
        return this._x;
    }
    get active() {
        return this._active;
    }
    get y() {
        return this._y;
    }
    get barColor() {
        return this._barColor;
    }
    get barWidth() {
        return this._barWidth;
    }
    updatePos(x, y) {
        this._x = x;
        this._y = y;
    }
    inactivate() {
        this._x = 700;
        this._y = 500;
        this._active = false;
    }
    //code taken from chat gpt
    /**
     *
     * returns a colour based on a percent of amount health left, ranging from green to red
     */
    getRGBFromPercent(percent) {
        // Ensure percent is within the bounds of 0 to 100
        percent = Math.max(0, Math.min(100, percent));
        // Calculate the red and green components
        let red, green;
        if (percent < 50) {
            // From 0 to 50%, we move from red to yellow
            red = 255;
            green = Math.round(255 * (percent / 50));
        }
        else {
            // From 50 to 100%, we move from yellow to green
            green = 255;
            red = Math.round(255 * ((50 - (percent - 50)) / 50));
        }
        // The blue component is always 0
        const blue = 0;
        // Return the RGB color as a string
        return `rgb(${red}, ${green}, ${blue})`;
    }
    update(percent) {
        this._barColor = this.getRGBFromPercent(percent);
        this._barWidth = percent / 100 * this.maxBarWidth;
    }
    draw() {
        const context = this.context;
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(this._x, this._y, this.width, this.height);
        context.fillStyle = "grey";
        context.fillRect(this._x + 1 + this._barWidth, this._y + 1, 1, this.barHeight);
        context.fillStyle = this.barColor;
        context.fillRect(this._x + 1, this._y + 1, this._barWidth, this.barHeight);
    }
}
export { HealthBar };
//# sourceMappingURL=healthbar.js.map