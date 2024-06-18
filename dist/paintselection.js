// DO I KEEP?
// class Selections {
import { CanvasManager } from "./canvasmanager.js";
import { SelectionCanvas } from "./selectionCanvas.js";
import { DirectionTower, LinearRadiusTower, LinearTower, PathTower } from "./tower.js";
import { TowerDrawing } from "./towerDrawing.js";
//     constructor() {
//         new PaintSelections().drawSelections();
//     }
// }
class PaintSelections {
    player;
    context = CanvasManager.instance.SelectionCanvas.context;
    shapeDrawer = new CircularRectangle();
    money = 0;
    colour = "";
    backgroundColour = "";
    constructor(player) {
        this.player = player;
    }
    drawSelections(bool1 = false, bool2 = false, bool3 = false, bool4 = false, bool5 = false) {
        if (CanvasManager.GameCanvas.game) {
            if (this.player) {
                this.money = CanvasManager.GameCanvas.game.player.money; // Not sure how to get the money another way without putting stuff into selectionCanvas
            }
            else {
                this.money = 0;
            }
        }
        this.shapeDrawer.drawRoundedRect(this.context, 10, 10, SelectionCanvas.WIDTH - 20, SelectionCanvas.HEIGHT - 20, 25, "black", "gray", 5);
        this.drawSelectionButton(bool1, 1, LinearTower.cost);
        this.drawSelectionButton(bool2, 2, DirectionTower.cost);
        this.drawSelectionButton(bool3, 3, PathTower.cost);
        this.drawSelectionButton(bool4, 4, LinearRadiusTower.cost);
        this.drawCostText();
        //Fix this drawing once finished the characters classes
        this.drawTowersOnButtons();
    }
    changeColour(bool) {
        if (bool) {
            return "rgb(255,204,204)";
        }
        return "rgb(224,255,255)";
    }
    drawSelectionButton(bool, buttonNumber, cost) {
        this.colour = this.changeColour(bool);
        this.backgroundColour = "white";
        if (this.money < cost) {
            this.backgroundColour = "red";
            this.colour = "red";
        }
        this.shapeDrawer.drawRoundedRect(this.context, 30 + (100 * (buttonNumber - 1)), 15, 50, 50, 5, this.colour, this.backgroundColour, 2);
    }
    drawCostText() {
        this.context.fillStyle = "white";
        this.context.font = "14px Arial";
        this.context.fillText(`$${LinearTower.cost}`, 25, 80);
        this.context.fillText(`$${DirectionTower.cost}`, 125, 80);
        this.context.fillText(`$${PathTower.cost}`, 225, 80);
        this.context.fillText(`$${LinearRadiusTower.cost}`, 325, 80); //fix with character cost
    }
    drawTowersOnButtons() {
        const context = CanvasManager.instance.SelectionCanvas.context;
        TowerDrawing.drawCharacter1(context, 30, 15, 0.5);
        TowerDrawing.drawCharacter2(context, 130, 15, 0.5);
        TowerDrawing.drawCharacter3(context, 230, 15, 0.5);
        TowerDrawing.drawCharacter4(context, 330, 15, 0.5);
    }
}
class CircularRectangle {
    drawRoundedRect(context, x, y, width, height, radius, fillColor, strokeColor, lineWidth) {
        if (width < 2 * radius)
            radius = width / 2;
        if (height < 2 * radius)
            radius = height / 2;
        context.beginPath();
        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
        context.fillStyle = fillColor;
        context.fill();
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeColor;
        context.stroke();
    }
}
export { PaintSelections };
//# sourceMappingURL=paintselection.js.map