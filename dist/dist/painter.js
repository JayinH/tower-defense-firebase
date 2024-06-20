"use strict";
class Painter {
    static paintGrid(gridInformation) {
        const canvas = Canvas.instance.element;
        canvas.width = Canvas.WIDTH;
        canvas.height = Canvas.HEIGHT;
        const context = Canvas.instance.context;
        for (let i = 0; i < gridInformation.length; i++) {
            context.fillStyle = gridInformation[i].color;
            context.fillRect(gridInformation[i].xOffset, gridInformation[i].yOffset, gridInformation[i].width, gridInformation[i].height);
        }
    }
}
//# sourceMappingURL=painter.js.map