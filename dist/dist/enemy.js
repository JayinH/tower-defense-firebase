import { moveEnemyCommand } from "./command.js";
import { HealthBar } from "./healthbar.js";
class Enemy {
    context;
    _x;
    _y;
    _r;
    enemyPath;
    _player;
    moveSpd;
    nextSquare;
    _direction = "";
    _madeItToEnd = false;
    _currentSquareIndex = 0;
    moveCmnd;
    _active = true;
    maxHP = 3;
    _HP = 3;
    _healthBar;
    _color = "red";
    _enemyLevel = 1;
    _isAlive = true;
    constructor(context, _x, _y, _r, enemyPath, _player, moveSpd) {
        this.context = context;
        this._x = _x;
        this._y = _y;
        this._r = _r;
        this.enemyPath = enemyPath;
        this._player = _player;
        this.moveSpd = moveSpd;
        this.nextSquare = enemyPath[1];
        this._direction = enemyPath[0].direction;
        this._healthBar = new HealthBar(this.context, this._x - this._r, this._y - 30);
        this.moveCmnd = new moveEnemyCommand(this._x, this._y, this._r, this._color, this.enemyPath, this.nextSquare, this._direction, this.moveSpd, this._currentSquareIndex, this);
    }
    get player() {
        return this._player;
    }
    get HP() {
        return this._HP;
    }
    get active() {
        return this._active;
    }
    get healthBar() {
        return this._healthBar;
    }
    get isAlive() {
        return this._isAlive;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get r() {
        return this._r;
    }
    get currentSquareIndex() {
        return this._currentSquareIndex;
    }
    get madeItToEnd() {
        return this._madeItToEnd;
    }
    get enemyLevel() {
        return this._enemyLevel;
    }
    get color() {
        return this._color;
    }
    win() {
        this._madeItToEnd = true;
    }
    increaseCurrentSquareIndex() {
        this._currentSquareIndex++;
    }
    increaseXPos(increaseXAmount) {
        if (increaseXAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._x += increaseXAmount;
    }
    increaseYPos(increaseYAmount) {
        if (increaseYAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._y += increaseYAmount;
    }
    decreaseXPos(decreaseXAmount) {
        if (decreaseXAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._x -= decreaseXAmount;
    }
    decreaseYPos(decreaseYAmount) {
        if (decreaseYAmount <= 0) {
            throw new Error("Must enter a positive value.");
        }
        this._y -= decreaseYAmount;
    }
    /**
     * inactivates the enemy and the health bar and moves off the canvas
     */
    inactivate() {
        this._x = 700;
        this._y = 500;
        this._active = false;
        if (this.healthBar)
            this.healthBar.inactivate();
    }
    /**
     * Executes a command to move the enemy and the health bar
     */
    move() {
        if (this.moveCmnd)
            this.moveCmnd.execute();
        this.updateHealthBarPos();
    }
    /**
     * Moves the health bar with the enemy
     */
    updateHealthBarPos() {
        if (this.healthBar) {
            this.healthBar.updatePos(this._x - this._r, this._y - 30);
        }
    }
    draw() {
        this.context.beginPath();
        this.context.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.context.fillStyle = this._color;
        this.context.fill();
    }
}
class Enemy1 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 1);
        this._HP = 3;
        this.maxHP = 3;
        this._color = "rgb(216, 51, 39)";
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(1);
            this.inactivate();
        }
    }
}
class Enemy2 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 3;
        this.maxHP = 3;
        this._color = "rgb(71, 146, 218)";
        this._enemyLevel = 2;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }
}
class Enemy3 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 1);
        this._HP = 5;
        this.maxHP = 5;
        this._color = "rgb(124, 163, 48)";
        this._enemyLevel = 3;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }
}
class Enemy4 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 0.4);
        this._HP = 100;
        this.maxHP = 100;
        this._color = "rgb(129, 34, 214)";
        this._enemyLevel = 4;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(20);
            this.inactivate();
        }
    }
}
class Enemy5 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 7;
        this.maxHP = 7;
        this._color = "#FFF5C3";
        this._enemyLevel = 5;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }
}
class Enemy6 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 4);
        this._HP = 10;
        this.maxHP = 10;
        this._color = "#0f4c81";
        this._enemyLevel = 6;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(2);
            this.inactivate();
        }
    }
}
class Enemy7 extends Enemy {
    constructor(context, x, y, r, enemyPath, player) {
        super(context, x, y, r, enemyPath, player, 2);
        this._HP = 165;
        this.maxHP = 165;
        this._color = "#f5b190";
        this._enemyLevel = 7;
    }
    loseHealth(decreaseHealth) {
        if (decreaseHealth <= 0) {
            throw new Error("Must be a positive value.");
        }
        this._HP -= decreaseHealth;
        if (this.healthBar)
            this.healthBar.update((this._HP / this.maxHP) * 100);
        if (this._HP <= 0) {
            this._isAlive = false;
            this.player.receiveMoney(40);
            this.inactivate();
        }
    }
}
class EnemyMaker {
    context;
    x;
    y;
    r;
    enemyPath;
    player;
    level;
    constructor(context, x, y, r, enemyPath, player, level) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.r = r;
        this.enemyPath = enemyPath;
        this.player = player;
        this.level = level;
        this.MakeEnemy1();
    }
    /**
     *
     * @returns Enemy
     * returns an  ememy based on a number input representing the enemy level
     */
    makeEnemy() {
        if (this.level == 1) {
            return this.MakeEnemy1();
        }
        else if (this.level == 2) {
            return this.MakeEnemy2();
        }
        else if (this.level == 3) {
            return this.MakeEnemy3();
        }
        else if (this.level == 4) {
            return this.MakeEnemy4();
        }
        else if (this.level == 5) {
            return this.MakeEnemy5();
        }
        else if (this.level == 6) {
            return this.MakeEnemy6();
        }
        else if (this.level == 7) {
            return this.MakeEnemy7();
        }
        else {
            return this.MakeEnemy1();
        }
    }
    MakeEnemy1() {
        return new Enemy1(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy2() {
        return new Enemy2(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy3() {
        return new Enemy3(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy4() {
        return new Enemy4(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy5() {
        return new Enemy5(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy6() {
        return new Enemy6(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
    MakeEnemy7() {
        return new Enemy7(this.context, this.x, this.y, this.r, this.enemyPath, this.player);
    }
}
export { Enemy, EnemyMaker };
//# sourceMappingURL=enemy.js.map