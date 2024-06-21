import { GameCanvas } from "./gamecanvas.js";
import { PathBlock } from "./pathclass.js";
class Bullet {
    context;
    _x;
    _y;
    _r;
    color;
    attackPower;
    _targetX = 0;
    _targetY = 0;
    END_OF_PATH_X = PathBlock.endpointX;
    END_OF_PATH_Y = PathBlock.endpointY;
    MOVE_SPD = 9;
    _active = true;
    constructor(context, _x, _y, _r, color, attackPower) {
        this.context = context;
        this._x = _x;
        this._y = _y;
        this._r = _r;
        this.color = color;
        this.attackPower = attackPower;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._x;
    }
    get r() {
        return this._x;
    }
    get active() {
        return this._active;
    }
    get targetX() {
        return this._targetX;
    }
    get targetY() {
        return this._targetY;
    }
    draw() {
        if (this._active) {
            this.context.beginPath();
            this.context.fillStyle = this.color;
            this.context.arc(this._x, this._y, this._r, 0, Math.PI * 2);
            this.context.fill();
        }
    }
    /**
     * inactivates the bullet and moves it off screen
     */
    inactivate() {
        this._active = false;
        this._x = GameCanvas.WIDTH + this._r;
        this._y = GameCanvas.HEIGHT + this._r;
    }
}
class LinearTowerBullet extends Bullet {
    enemyPath;
    constructor(context, x, y, r, color, attackPower, enemyPath) {
        super(context, x, y, r, color, attackPower);
        this.enemyPath = enemyPath;
    }
    /**
     * Iterates through all enemies and checks which one(s) are on the furtherst square (closest to exit)
     * Out of the ones on the furthest square, the distances are compared using the center of the enemy and
     * the center of the square/exit to determine which one is closest to the end.
     * The one closest to the end is selected as the target enemy
     * If the enemy is still active, directBullet() is called
     */
    moveBullet(allEnemies) {
        let furthestSquare = -1;
        let possibleEnemies = [];
        for (let enemy of allEnemies) {
            if (enemy.currentSquareIndex > furthestSquare) {
                possibleEnemies = [enemy];
                furthestSquare = enemy.currentSquareIndex;
            }
            else if (enemy.currentSquareIndex == furthestSquare) {
                possibleEnemies.push(enemy);
            }
        }
        let targetEnemy = possibleEnemies[0];
        for (let enemy of possibleEnemies) {
            let dxE = 0;
            let dyE = 0;
            let dxS = 0;
            let dyS = 0;
            let distanceS = 0;
            let distanceE = 0;
            if (furthestSquare >= this.enemyPath.length - 1) {
                dxE = enemy.x - this.END_OF_PATH_X;
                dyE = enemy.y - this.END_OF_PATH_Y;
                distanceE = Math.sqrt(Math.pow(dxE, 2) + Math.pow(dyE, 2));
                dxS = targetEnemy.x - this.END_OF_PATH_X;
                dyS = targetEnemy.y - this.END_OF_PATH_Y;
                distanceS = Math.sqrt(Math.pow(dxS, 2) + Math.pow(dyS, 2));
                if (Math.abs(distanceE) < Math.abs(distanceS)) {
                    targetEnemy = enemy;
                }
            }
            else {
                dxE = enemy.x - this.enemyPath[furthestSquare + 1].centerX;
                dyE = enemy.y - this.enemyPath[furthestSquare + 1].centerY;
                distanceE = Math.sqrt(Math.pow(dxE, 2) + Math.pow(dyE, 2));
                dxS = targetEnemy.x - this.enemyPath[furthestSquare + 1].centerX;
                dyS = targetEnemy.y - this.enemyPath[furthestSquare + 1].centerY;
                distanceS = Math.sqrt(Math.pow(dxS, 2) + Math.pow(dyS, 2));
                if (Math.abs(distanceE) < Math.abs(distanceS)) {
                    targetEnemy = enemy;
                }
            }
        }
        if (this._active) {
            this._targetX = targetEnemy.x;
            this._targetY = targetEnemy.y;
            const xDistance = this._x - this._targetX;
            const yDistance = this._y - this._targetY;
            const totalDistance = Math.sqrt(Math.pow((this._x - this._targetX), 2) + Math.pow((this._y - this._targetY), 2));
            this.directBullet(xDistance, yDistance, totalDistance, targetEnemy);
        }
    }
    /**
     *
     * @param x - x distance away from enemy
     * @param y - y distance away from enemy
     * @param total - x and y (together) distance away from enemy
     * @param enemy - the target enemy
     * Similar triangles are used to increase the x and y proportional to the move speed
     * The bullet checks if it hits the enemy
     */
    directBullet(x, y, total, enemy) {
        const ySpd = y * this.MOVE_SPD / total;
        const xSpd = Math.abs(x * this.MOVE_SPD / total);
        this._y -= ySpd;
        if (this._targetX > this._x) {
            this._x += xSpd;
        }
        else {
            this._x -= xSpd;
        }
        this.checkIfHit(enemy);
    }
    /**
     * The bullet is checked to see if it collided with the enemy
     * If it collides, the enemy loses health and the bullet inactivates.
     * If the bullet reaches the end of the screen, it inactivates.
     */
    checkIfHit(selectedEnemy) {
        const enemy = selectedEnemy;
        const dx = this._x - enemy.x;
        const dy = this._y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= this._r + enemy.r) {
            enemy.loseHealth(this.attackPower);
            this.inactivate();
        }
        if (this._x + this._r >= GameCanvas.WIDTH || this._x - this._r <= 0 || this._y + this._r >= GameCanvas.HEIGHT || this._y - this._r <= 0) {
            this.inactivate();
        }
    }
}
class DirectionTowerBullet extends Bullet {
    direction;
    hitEnemies = [];
    constructor(context, x, y, r, color, attackPower, direction) {
        super(context, x, y, r, color, attackPower);
        this.direction = direction;
    }
    /**
     *
     * @param enemies - all the current enemies
     * If the bullet is active, it goes in the direction it's been set up for.
     * The bullet checks if it hit an enemy
     */
    launch(enemies) {
        if (this._active) {
            if (this.direction == "right") {
                this._x += this.MOVE_SPD;
            }
            if (this.direction == "left") {
                this._x -= this.MOVE_SPD;
            }
            if (this.direction == "up") {
                this._y -= this.MOVE_SPD;
            }
            if (this.direction == "down") {
                this._y += this.MOVE_SPD;
            }
            this.checkIfHit(enemies);
        }
    }
    /**
     *
     * @param enemies - all the current enemies
     * Compares the distance between the radius of the enemy and the bullet to see if a collision occured
     * If a collision occured, the enemy takes damage
     * The enemy is added to an array that is checked to ensure the same enemy doesn't receive damage multiple times from one bullet
     * If the bullet goes off screen, it inactivates
     */
    checkIfHit(enemies) {
        for (let enemy of enemies) {
            if (!this.hitEnemies.includes(enemy)) {
                const dx = this._x - enemy.x;
                const dy = this._y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= this._r + enemy.r) {
                    enemy.loseHealth(this.attackPower);
                    this.hitEnemies.push(enemy);
                    // this.inactivate()
                }
            }
        }
        if (this._x + this._r >= 600 || this._x - this._r <= 0) {
            this.inactivate();
        }
    }
}
class LinearRadiusTowerBullet extends Bullet {
    enemyPath;
    firingRadius;
    constructor(context, x, y, r, color, attackPower, enemyPath, firingRadius) {
        super(context, x, y, r, color, attackPower);
        this.enemyPath = enemyPath;
        this.firingRadius = firingRadius;
    }
    startX = this._x;
    startY = this._y;
    /**
     * Iterates through all enemies and checks which one(s) are on the furtherst square (closest to exit)
     * Out of the ones on the furthest square, the distances are compared using the center of the enemy and
     * the center of the square/exit to determine which one is closest to the end.
     * The one closest to the end is selected as the target enemy
     * If the enemy is still active, directBullet() is called
     */
    moveBulletToFurthestEnemy(allEnemies) {
        let enemiesInRange = [];
        for (let enemy of allEnemies) {
            let dx = this.startX - enemy.x;
            let dy = this.startY - enemy.y;
            let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - enemy.r;
            if (distance <= this.firingRadius) {
                enemiesInRange.push(enemy);
            }
        }
        let furthestSquare = -1;
        let possibleEnemies = [];
        for (let enemy of enemiesInRange) {
            if (enemy.currentSquareIndex > furthestSquare) {
                possibleEnemies = [enemy];
                furthestSquare = enemy.currentSquareIndex;
            }
            else if (enemy.currentSquareIndex == furthestSquare) {
                possibleEnemies.push(enemy);
            }
        }
        if (possibleEnemies.length) {
            let targetEnemy = possibleEnemies[0];
            for (let enemy of possibleEnemies) {
                let dxE = 0;
                let dyE = 0;
                let dxS = 0;
                let dyS = 0;
                let distanceS = 0;
                let distanceE = 0;
                if (furthestSquare >= this.enemyPath.length - 1) {
                    dxE = enemy.x - this.END_OF_PATH_X;
                    dyE = enemy.y - this.END_OF_PATH_Y;
                    distanceE = Math.sqrt(Math.pow(dxE, 2) + Math.pow(dyE, 2));
                    dxS = targetEnemy.x - this.END_OF_PATH_X;
                    dyS = targetEnemy.y - this.END_OF_PATH_Y;
                    distanceS = Math.sqrt(Math.pow(dxS, 2) + Math.pow(dyS, 2));
                }
                else {
                    dxE = enemy.x - this.enemyPath[furthestSquare + 1].centerX;
                    dyE = enemy.y - this.enemyPath[furthestSquare + 1].centerY;
                    distanceE = Math.sqrt(Math.pow(dxE, 2) + Math.pow(dyE, 2));
                    dxS = targetEnemy.x - this.enemyPath[furthestSquare + 1].centerX;
                    dyS = targetEnemy.y - this.enemyPath[furthestSquare + 1].centerY;
                    distanceS = Math.sqrt(Math.pow(dxS, 2) + Math.pow(dyS, 2));
                }
                if (Math.abs(distanceE) < Math.abs(distanceS)) {
                    targetEnemy = enemy;
                }
            }
            if (this._active) {
                this._targetX = targetEnemy.x;
                this._targetY = targetEnemy.y;
                const xDistance = this._x - this._targetX;
                const yDistance = this._y - this._targetY;
                const totalDistance = Math.sqrt(Math.pow((this._x - this._targetX), 2) + Math.pow((this._y - this._targetY), 2));
                this.directBullet(xDistance, yDistance, totalDistance, targetEnemy);
            }
        }
        else {
            this.inactivate();
        }
    }
    moveBulletToClosestEnemy(allEnemies) {
        let enemiesInRange = [];
        for (let enemy of allEnemies) {
            let dx = this.startX - enemy.x;
            let dy = this.startY - enemy.y;
            let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - enemy.r;
            if (distance <= this.firingRadius) {
                enemiesInRange.push(enemy);
            }
        }
        if (enemiesInRange.length) {
            let targetEnemy = enemiesInRange[0];
            for (let enemy of enemiesInRange) {
                let dxE = 0;
                let dyE = 0;
                let dxS = 0;
                let dyS = 0;
                let distanceS = 0;
                let distanceE = 0;
                dxE = enemy.x - this.startX;
                dyE = enemy.y - this.startY;
                distanceE = Math.sqrt(Math.pow(dxE, 2) + Math.pow(dyE, 2));
                dxS = targetEnemy.x - this.startX;
                dyS = targetEnemy.y - this.startY;
                distanceS = Math.sqrt(Math.pow(dxS, 2) + Math.pow(dyS, 2));
                if (Math.abs(distanceE) < Math.abs(distanceS)) {
                    targetEnemy = enemy;
                }
            }
            if (this._active) {
                this._targetX = targetEnemy.x;
                this._targetY = targetEnemy.y;
                const xDistance = this._x - this._targetX;
                const yDistance = this._y - this._targetY;
                const totalDistance = Math.sqrt(Math.pow((this._x - this._targetX), 2) + Math.pow((this._y - this._targetY), 2));
                this.directBullet(xDistance, yDistance, totalDistance, targetEnemy);
            }
        }
        else {
            this.inactivate();
        }
    }
    moveBulletToStrongestEnemy(allEnemies) {
        let enemiesInRange = [];
        for (let enemy of allEnemies) {
            let dx = this.startX - enemy.x;
            let dy = this.startY - enemy.y;
            let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) - enemy.r;
            if (distance <= this.firingRadius) {
                enemiesInRange.push(enemy);
            }
        }
        if (enemiesInRange.length) {
            let targetEnemy = enemiesInRange[0];
            for (let enemy of enemiesInRange) {
                if (enemy.HP > targetEnemy.HP) {
                    targetEnemy = enemy;
                }
            }
            if (this._active) {
                this._targetX = targetEnemy.x;
                this._targetY = targetEnemy.y;
                const xDistance = this._x - this._targetX;
                const yDistance = this._y - this._targetY;
                const totalDistance = Math.sqrt(Math.pow((this._x - this._targetX), 2) + Math.pow((this._y - this._targetY), 2));
                this.directBullet(xDistance, yDistance, totalDistance, targetEnemy);
            }
        }
        else {
            this.inactivate();
        }
    }
    /**
     *
     * @param x - x distance away from enemy
     * @param y - y distance away from enemy
     * @param total - x and y (together) distance away from enemy
     * @param enemy - the target enemy
     * Similar triangles are used to increase the x and y proportional to the move speed
     * The bullet checks if it hits the enemy
     */
    directBullet(x, y, total, enemy) {
        const ySpd = y * this.MOVE_SPD / total;
        const xSpd = Math.abs(x * this.MOVE_SPD / total);
        this._y -= ySpd;
        if (this._targetX > this._x) {
            this._x += xSpd;
        }
        else {
            this._x -= xSpd;
        }
        this.checkIfHit(enemy);
    }
    /**
     * The bullet is checked to see if it collided with the enemy
     * If it collides, the enemy loses health and the bullet inactivates.
     * If the bullet reaches the end of the screen, it inactivates.
     */
    checkIfHit(selectedEnemy) {
        const enemy = selectedEnemy;
        const dx = this._x - enemy.x;
        const dy = this._y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= this._r + enemy.r) {
            enemy.loseHealth(this.attackPower);
            this.inactivate();
        }
        if (this._x + this._r >= GameCanvas.WIDTH || this._x - this._r <= 0 || this._y + this._r >= GameCanvas.HEIGHT || this._y - this._r <= 0) {
            this.inactivate();
        }
    }
}
export { Bullet, LinearTowerBullet, LinearRadiusTowerBullet, DirectionTowerBullet };
//# sourceMappingURL=bullet.js.map