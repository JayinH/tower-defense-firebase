import { CanvasManager } from "./canvasmanager.js";
import { Command, moveEnemyCommand } from "./command.js";
import { HealthBar } from "./healthbar.js";
import { PathBlock } from "./pathclass.js";
import { Player } from "./player.js";

interface EnemyInfo {
    isAlive: boolean,
    healthBar: HealthBar,
    enemyLevel: number,
    active: boolean,
    HP: number,
    color: string,
    x: number,
    y: number,
    r: number
    player: Player,
    moveSpd: number
}

abstract class Enemy implements EnemyInfo {
    protected nextSquare: PathBlock | undefined;
    protected _direction: string = ""
    protected _madeItToEnd = false;

    protected _currentSquareIndex: number = 0
    protected moveCmnd: Command | undefined;
    protected _active: boolean = true;
    protected maxHP: number = 3;
    protected _HP: number = 3;
    protected _healthBar: HealthBar;
    protected _color: string = "red";
    protected _enemyLevel: number = 1;
    protected _isAlive = true;


    constructor(
        private context: CanvasRenderingContext2D,
        private _x: number,
        private _y: number,
        private _r: number,
        protected enemyPath: PathBlock[],
        protected _player: Player,
        readonly moveSpd: number
    ) {
        this.nextSquare = enemyPath[1];
        this._direction = enemyPath[0].direction;
        this._healthBar = new HealthBar(this.context, this._x - this._r, this._y - 30);
        this.moveCmnd = new moveEnemyCommand(this._x, this._y, this._r, this._color, this.enemyPath, this.nextSquare, this._direction, this.moveSpd, this._currentSquareIndex, this);
    }

    public get player(): Player {
        return this._player;
    }

    public get HP(): number {
        return this._HP;
    }

    public get active(): boolean {
        return this._active;
    }

    public get healthBar(): HealthBar {
        return this._healthBar;
    }

    public get isAlive() {
        return this._isAlive;
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public get r() {
        return this._r;
    }

    public get currentSquareIndex(): number {
        return this._currentSquareIndex;
    }

    public get madeItToEnd(): boolean {
        return this._madeItToEnd;
    }

    public get enemyLevel(): number {
        return this._enemyLevel;
    }

    public get color(): string {
        return this._color;
    }

    public win(): void {
        this._madeItToEnd = true;
    }

    public increaseCurrentSquareIndex(): void {
        this._currentSquareIndex++;
    }



    public increaseXPos(increaseXAmount: number) {
        if (increaseXAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._x += increaseXAmount
    }


    public increaseYPos(increaseYAmount: number) {
        if (increaseYAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._y += increaseYAmount
    }

    public decreaseXPos(decreaseXAmount: number) {
        if (decreaseXAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._x -= decreaseXAmount;
    }

    public decreaseYPos(decreaseYAmount: number) {
        if (decreaseYAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._y -= decreaseYAmount;
    }


    /**
     * inactivates the enemy and the health bar and moves off the canvas
     */
    public inactivate() {
        this._x = 700;
        this._y = 500;
        this._active = false;
        if (this.healthBar) this.healthBar.inactivate();
    }

    /**
     * Executes a command to move the enemy and the health bar
     */

    public move() {
        if (this.moveCmnd) this.moveCmnd.execute()
        this.updateHealthBarPos();
    }

    /**
     * Moves the health bar with the enemy
     */

    private updateHealthBarPos() {
        if (this.healthBar) {
            this.healthBar.updatePos(this._x - this._r, this._y - 30);
        }

    }

    public draw() {

        this.context.beginPath()
        this.context.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.context.fillStyle = this._color;
        this.context.fill();
    }

    /**
     * 
     * @param decreaseHealth - HP being lost
     * decreases the HP and updates the health bar accordingly
     * checks if HP is <= 0 and inactivates it if it is, as well as rewards player with money
     */


    abstract loseHealth(decreaseHealth: number): void;
}

class Enemy1 extends Enemy {
    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {

        super(context, x, y, r, enemyPath, player, 1);
        this._HP = 3;
        this.maxHP = 3;
        this._color = "rgb(216, 51, 39)"
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(1);
            this.inactivate();
        }


    }

}

class Enemy2 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 3;
        this.maxHP = 3;
        this._color = "rgb(71, 146, 218)"
        this._enemyLevel = 2;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }


}

class Enemy3 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 1);
        this._HP = 5;
        this.maxHP = 5;
        this._color = "rgb(124, 163, 48)"
        this._enemyLevel = 3;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }
}

class Enemy4 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 0.4);
        this._HP = 100;
        this.maxHP = 100;
        this._color = "rgb(129, 34, 214)";
        this._enemyLevel = 4;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(20);
            this.inactivate();
        }
    }

}

class Enemy5 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 7;
        this.maxHP = 7;
        this._color = "#FFF5C3";
        this._enemyLevel = 5;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }

}

class Enemy6 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 4);
        this._HP = 10;
        this.maxHP = 10;
        this._color = "#0f4c81";
        this._enemyLevel = 6;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }

}

class Enemy7 extends Enemy {

    constructor(context: CanvasRenderingContext2D,x: number, y: number, r: number, enemyPath: PathBlock[], player: Player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 165;
        this.maxHP = 165;
        this._color = "#f5b190";
        this._enemyLevel = 7;
    }

    public loseHealth(decreaseHealth: number) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.")
        }
        this._HP -= decreaseHealth;
        if (this.healthBar) this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false
            this.player.receiveMoney(40);
            this.inactivate();
        }
    }

}

interface EnemyMakerInfo {
    x: number,
    y: number,
    r: number
    enemyPath: PathBlock[],
    player: Player,
    level: number
}

class EnemyMaker implements EnemyMakerInfo {
    constructor(
        private context: CanvasRenderingContext2D,
        readonly x: number,
        readonly y: number,
        readonly r: number,
        readonly enemyPath: PathBlock[],
        readonly player: Player,
        readonly level: number

    ) {
        this.MakeEnemy1();
    }

    /**
     * 
     * @returns Enemy
     * returns an  ememy based on a number input representing the enemy level
     */
    public makeEnemy(): Enemy {
        if (this.level == 1) {
            return this.MakeEnemy1();
        } else if (this.level == 2) {
            return this.MakeEnemy2();
        } else if (this.level == 3) {
            return this.MakeEnemy3();
        } else if (this.level == 4) {
            return this.MakeEnemy4();
        }
        else if (this.level == 5) {
            return this.MakeEnemy5();
        }
        else if (this.level == 6) {
            return this.MakeEnemy6();
        } else if (this.level == 7) {
            return this.MakeEnemy7();
        } else {
            return this.MakeEnemy1();
        }

    }

    private MakeEnemy1(): Enemy {
        return new Enemy1(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy2(): Enemy {
        return new Enemy2(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy3(): Enemy {
        return new Enemy3(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy4(): Enemy {
        return new Enemy4(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy5(): Enemy {
        return new Enemy5(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy6(): Enemy {
        return new Enemy6(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

    private MakeEnemy7(): Enemy {
        return new Enemy7(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }

}

export {Enemy, EnemyMaker}