import { GameCanvas } from "./gamecanvas.js";
import { GrassBlock, PathBlock } from "./pathclass.js";

interface MapBuilderInfo {
    pathDirection: string[];
    pathBlocks: PathBlock[];
    grassBlocks: GrassBlock[];
    backgroundColour1: string,
    backgroundColour2: string,
    pathColour: string,
    pathLocation: number[][],
    squareLength: number | null,
    rows?: number | null,
    columns?: number | null,
    buildMap(): [GrassBlock[], PathBlock[]] | void
}

class MapBuilder implements MapBuilderInfo{
    private _pathDirection: string[] = [];
    private _pathBlocks: PathBlock[] = [];
    private _grassBlocks: GrassBlock[] = [];
    constructor(
        private context: CanvasRenderingContext2D,
        private _backgroundColour1: string,
        private _backgroundColour2: string,
        private _pathColour: string,
        private _pathLocation: number[][],
        private _squareLength: number | null,
        private _rows?: number | null,
        private _columns?: number | null

    ) {
        this.initialize()

    }
// Getters for protected variables
    get pathDirection(): string[] {
        return this._pathDirection;
    }

    get pathBlocks(): PathBlock[] {
        return this._pathBlocks;
    }

    get grassBlocks(): GrassBlock[] {
        return this._grassBlocks;
    }

    
    get backgroundColour1(): string {
        return this._backgroundColour1;
    }

    get backgroundColour2(): string {
        return this._backgroundColour2;
    }

    get pathColour(): string {
        return this._pathColour;
    }

    get pathLocation(): number[][] {
        return this._pathLocation;
    }

    get squareLength(): number | null {
        return this._squareLength;
    }

    get rows(): number | null | undefined {
        return this._rows;
    }

    get columns(): number | null | undefined {
        return this._columns;
    }

    /**
     * Takes either square length, rows, or columns and generates a grid accordingly
     * Determines whether their input is possible, based off of the Canvas width/height
     */
    private initialize(): void {
        if (this._squareLength) {
            if (GameCanvas.WIDTH % this._squareLength !== 0 || GameCanvas.HEIGHT % this._squareLength !== 0) {
                throw new Error("That square length does not match the aspect ratio.")
            }
            this._rows = GameCanvas.HEIGHT / this._squareLength;
            this._columns = GameCanvas.WIDTH / this._squareLength
        } else if (this._rows) {

            this._squareLength = GameCanvas.HEIGHT / this._rows;
            if (GameCanvas.WIDTH % this._squareLength != 0) {
                console.log("That is not a possible amount of rows")
            }
            this._columns = GameCanvas.WIDTH / this._squareLength

        } else if (this._columns) {

            this._squareLength = GameCanvas.WIDTH / this._columns;
            if (GameCanvas.HEIGHT % this._squareLength != 0) {
                console.log("That is not a possible amount of columns")
            }
            this._rows = GameCanvas.HEIGHT / this._squareLength;

        } else {
            throw new Error("Not possible");
        }
    }

    //code adapted from ChatGPT
    private exists(searchElement: [number, number]): boolean {
        const containsArray = this._pathLocation.some(innerArray =>
            innerArray.length === searchElement.length &&
            innerArray.every((value, index) => value === searchElement[index])
        );
        return containsArray;
    }

    /**
     * 
     * Iterate through each element and determine the direction based on the next square
     * Go through all elements in a nested for loop and create a PathBlock if [i, j] is in the path input
     * Otherwise, create a grass block with alternating colors
     * Set the startpoint + endpoint of the path based on the first/last index
     */

    public buildMap(): [GrassBlock[], PathBlock[]] | void {
        if (this._squareLength && this._rows && this._columns) {

            for (let i = 0; i < this._pathLocation.length; i++) {
                if (i !== this._pathLocation.length - 1) {
                    if (this._pathLocation[i + 1][0] - this._pathLocation[i][0] === 1) {
                        this._pathDirection.push("down");
                    } else if (this._pathLocation[i][0] - this._pathLocation[i + 1][0] === 1) {
                        this._pathDirection.push("up")
                    } else if (this._pathLocation[i + 1][1] - this._pathLocation[i][1] === 1) {
                        this._pathDirection.push("right")
                    } else if (this._pathLocation[i][1] - this._pathLocation[i + 1][1] === 1) {
                        this._pathDirection.push("left");
                    } else {
                        throw new Error("This path does not work");
                    }
                } else {
                    if (this._pathLocation[i][0] * this._squareLength + this._squareLength === GameCanvas.HEIGHT) {
                        this._pathDirection.push("down");
                    } else if (this._pathLocation[i][0] === 0) {
                        this._pathDirection.push("up");
                    } else if (this._pathLocation[i][1] * this._squareLength + this._squareLength === GameCanvas.WIDTH) {
                        this._pathDirection.push("right");
                    } else if (this._pathLocation[i][1] === 0) {
                        this._pathDirection.push("left");
                    } else {
                        throw new Error("This path does not work");
                    }
                }
                this._pathBlocks.push(new PathBlock(this.context, this._pathLocation[i][1] * this._squareLength, this._pathLocation[i][0] * this._squareLength, this._squareLength, this._squareLength, this._pathColour, this._pathDirection[i]));

            }

            for (let i = 0; i < this._rows; i++) {
                for (let j = 0; j < this._columns; j++) {

                    if (!this.exists([i, j])) {

                        if ((i + j) % 2 === 0) {  // Added parentheses to fix the logic
                            this._grassBlocks.push(new GrassBlock(this.context, j * this._squareLength, i * this._squareLength, this._squareLength, this._squareLength, this._backgroundColour1));

                        } else {
                            this._grassBlocks.push(new GrassBlock(this.context, j * this._squareLength, i * this._squareLength, this._squareLength, this._squareLength, this._backgroundColour2));
                        }
                    }
                }
            }
            PathBlock.startpointX = this._pathBlocks[0].centerX;
            // console.log(PathBlock.startpointX)
            // console.log(PathBlock.startpointY)
            PathBlock.startpointY = this._pathBlocks[0].centerY;

            PathBlock.endpointX = this._pathBlocks[this._pathBlocks.length - 1].centerX;
            PathBlock.endpointY = this._pathBlocks[this._pathBlocks.length - 1].centerY + this._squareLength;
            return [this._grassBlocks, this._pathBlocks];
        }


    }
}

export {MapBuilder}