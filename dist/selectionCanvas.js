import { PaintSelections } from "./paintselection.js";
class SelectionCanvas {
    // private static _instance: SelectionCanvas;
    _element = document.getElementById("selection_screen");
    context = this.element.getContext("2d");
    static WIDTH = 600;
    static HEIGHT = 100;
    // private constructor() {
    //     this._element.width = SelectionCanvas.WIDTH;
    //     this._element.height = SelectionCanvas.HEIGHT;
    // }
    constructor() {
        this._element.width = SelectionCanvas.WIDTH;
        this._element.height = SelectionCanvas.HEIGHT;
    }
    initialize() {
        // new Selections();
        new PaintSelections(null).drawSelections();
    }
    get element() {
        return this._element;
    }
}
export { SelectionCanvas };
//# sourceMappingURL=selectionCanvas.js.map