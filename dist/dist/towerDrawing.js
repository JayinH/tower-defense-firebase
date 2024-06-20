class TowerDrawing {
    constructor() { }
    static arrowHTML = document.getElementById("arrow");
    static catapultHTML = document.getElementById("catapult");
    static lightningHTML = document.getElementById("lightning");
    static drawCharacter1(context, coorX, coorY, sizeFactor) {
        context.fillStyle = "rgb(255,51,51)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (50 * sizeFactor), 45 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "rgb(255,102,102)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (50 * sizeFactor), 40 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //body
        context.fillStyle = "rgb(255,153,153)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (50 * sizeFactor), 35 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "rgb(255,102,102)";
        context.beginPath();
        context.arc(coorX + (10 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (90 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //eyes
        context.fillStyle = "white";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (30 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (30 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "black";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (25 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (25 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //mouth
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (39 * sizeFactor), 6 * sizeFactor, 2 * Math.PI, Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "red";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (39 * sizeFactor), 4 * sizeFactor, 2 * Math.PI, Math.PI);
        context.fill();
        context.closePath();
    }
    static drawCharacter4(context, coorX, coorY, sizeFactor) {
        //body
        context.fillStyle = "rgb(88,182,240)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (60 * sizeFactor), 40 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (10 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (90 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //eyes
        context.fillStyle = "white";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (40 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "black";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (35 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (35 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //mouth
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (28 * sizeFactor), 6 * sizeFactor, Math.PI, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "red";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (28 * sizeFactor), 4 * sizeFactor, Math.PI, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.save();
        TowerDrawing.catapultHTML.width = 50 * sizeFactor;
        TowerDrawing.catapultHTML.height = 50 * sizeFactor;
        context.translate(coorX + (20 * sizeFactor) + (TowerDrawing.catapultHTML.width / 2), coorY + (42.5 * sizeFactor) + (TowerDrawing.catapultHTML.height / 2));
        context.drawImage(TowerDrawing.catapultHTML, -1 * (TowerDrawing.catapultHTML.width / 2), -1 * (TowerDrawing.catapultHTML.height / 2), TowerDrawing.catapultHTML.width, TowerDrawing.catapultHTML.height);
        context.restore();
    }
    static drawCharacter2(context, coorX, coorY, sizeFactor) {
        context.fillStyle = "gray";
        context.fillRect(coorX + (45 * sizeFactor), coorY + (11 * sizeFactor), 10 * sizeFactor, 10 * sizeFactor);
        context.fillRect(coorX + (47.5 * sizeFactor), coorY + (1 * sizeFactor), 5 * sizeFactor, 9 * sizeFactor);
        context.fillRect(coorX + (45 * sizeFactor), coorY + (79 * sizeFactor), 10 * sizeFactor, 10 * sizeFactor);
        context.fillRect(coorX + (47.5 * sizeFactor), coorY + (90 * sizeFactor), 5 * sizeFactor, 9 * sizeFactor);
        context.fillRect(coorX + (79 * sizeFactor), coorY + (45 * sizeFactor), 10 * sizeFactor, 10 * sizeFactor);
        context.fillRect(coorX + (90 * sizeFactor), coorY + (47.5 * sizeFactor), 9 * sizeFactor, 5 * sizeFactor);
        context.fillRect(coorX + (11 * sizeFactor), coorY + (45 * sizeFactor), 10 * sizeFactor, 10 * sizeFactor);
        context.fillRect(coorX + (1 * sizeFactor), coorY + (47.5 * sizeFactor), 9 * sizeFactor, 5 * sizeFactor);
        //body
        context.fillStyle = "rgb(255,153,51)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (35 * sizeFactor), 20 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (65 * sizeFactor), 20 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (35 * sizeFactor), coorY + (50 * sizeFactor), 20 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (65 * sizeFactor), coorY + (50 * sizeFactor), 20 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //arms
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (15 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (15 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (85 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (85 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (15 * sizeFactor), coorY + (40 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (15 * sizeFactor), coorY + (60 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (85 * sizeFactor), coorY + (40 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (85 * sizeFactor), coorY + (60 * sizeFactor), 5 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //eyes
        context.fillStyle = "white";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (40 * sizeFactor), 8 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (40 * sizeFactor), 8 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "black";
        context.beginPath();
        context.arc(coorX + (40 * sizeFactor), coorY + (45 * sizeFactor), 4 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (60 * sizeFactor), coorY + (45 * sizeFactor), 4 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //mouth
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (54 * sizeFactor), 7.5 * sizeFactor, Math.PI * 2, Math.PI / 8 * 7);
        context.fill();
        context.closePath();
        context.fillStyle = "red";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (55 * sizeFactor), 5 * sizeFactor, Math.PI * 2, Math.PI / 8 * 7);
        context.fill();
        context.closePath();
    }
    static drawCharacter2Aim(context, coorX, coorY, position, sizeFactor) {
        this.arrowHTML.width = 15 * sizeFactor;
        this.arrowHTML.height = 15 * sizeFactor;
        context.save();
        switch (position) {
            case "right":
                context.translate(coorX + (70 * sizeFactor) + (this.arrowHTML.width / 2), coorY + (42.5 * sizeFactor) + (this.arrowHTML.height / 2));
                break;
            case "down":
                context.translate(coorX + (42.5 * sizeFactor) + (this.arrowHTML.width / 2), coorY + (70 * sizeFactor) + (this.arrowHTML.height / 2));
                context.rotate(Math.PI / 2);
                break;
            case "left":
                context.translate(coorX + (15 * sizeFactor) + (this.arrowHTML.width / 2), coorY + (42.5 * sizeFactor) + (this.arrowHTML.height / 2));
                context.rotate(Math.PI);
                break;
            default:
                context.translate(coorX + (42.5 * sizeFactor) + (this.arrowHTML.width / 2), coorY + (15 * sizeFactor) + (this.arrowHTML.height / 2));
                context.rotate(Math.PI * 1.5);
                break;
        }
        context.drawImage(this.arrowHTML, -1 * (this.arrowHTML.width / 2), -1 * (this.arrowHTML.height / 2), this.arrowHTML.width, this.arrowHTML.height);
        context.restore();
    }
    static drawCharacter3(context, coorX, coorY, sizeFactor) {
        //Eye Body
        context.fillStyle = "rgb(153,76,0)";
        context.beginPath();
        context.arc(coorX + (10 * sizeFactor), coorY + (50 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (90 * sizeFactor), coorY + (50 * sizeFactor), 10 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        //body continue
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (50 * sizeFactor), 35 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "rgb(102,51,0)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (50 * sizeFactor), 25 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "rgb(51,25,0)";
        context.beginPath();
        context.arc(coorX + (50 * sizeFactor), coorY + (55 * sizeFactor), 15 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.strokeStyle = "rgb(204,102,0)";
        context.beginPath();
        context.lineWidth = 4 * sizeFactor;
        context.lineCap = "round";
        context.moveTo(coorX + (30 * sizeFactor), coorY + (30 * sizeFactor));
        context.lineTo(coorX + (70 * sizeFactor), coorY + (70 * sizeFactor));
        context.moveTo(coorX + (75 * sizeFactor), coorY + (35 * sizeFactor));
        context.lineTo(coorX + (45 * sizeFactor), coorY + (75 * sizeFactor));
        context.moveTo(coorX + (55 * sizeFactor), coorY + (25 * sizeFactor));
        context.lineTo(coorX + (37 * sizeFactor), coorY + (73 * sizeFactor));
        context.stroke();
        context.closePath();
        //eyes
        context.fillStyle = "white";
        context.beginPath();
        context.arc(coorX + (10 * sizeFactor), coorY + (50 * sizeFactor), 8 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (90 * sizeFactor), coorY + (50 * sizeFactor), 8 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.fillStyle = "black";
        context.beginPath();
        context.arc(coorX + (10 * sizeFactor), coorY + (50 * sizeFactor), 4 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(coorX + (90 * sizeFactor), coorY + (50 * sizeFactor), 4 * sizeFactor, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }
}
export { TowerDrawing };
//# sourceMappingURL=towerDrawing.js.map