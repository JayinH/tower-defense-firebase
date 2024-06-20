import { PaintSelections } from "./paintselection.js";

class SelectionCanvas {
    // private static _instance: SelectionCanvas;
    private _element: HTMLCanvasElement = document.getElementById(
        "selection_screen"
    ) as HTMLCanvasElement;
    public context = this.element.getContext("2d") as CanvasRenderingContext2D;
    public static WIDTH = 600;
    public static HEIGHT= 100;
    // private constructor() {
    //     this._element.width = SelectionCanvas.WIDTH;
    //     this._element.height = SelectionCanvas.HEIGHT;
    // }

    public constructor() {
        this._element.width = SelectionCanvas.WIDTH;
        this._element.height = SelectionCanvas.HEIGHT;
    }

    public initialize() {
        // new Selections();
        new PaintSelections(null).drawSelections();
    }
    public get element(): HTMLCanvasElement {
        return this._element;
    }

    // public static get instance(): SelectionCanvas {
    //     if (!SelectionCanvas._instance) {
    //         SelectionCanvas._instance = new SelectionCanvas();
    //     }

    //     return SelectionCanvas._instance;
    // }


}

export {SelectionCanvas}