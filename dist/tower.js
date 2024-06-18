import { DirectionTowerBullet, LinearRadiusTowerBullet, LinearTowerBullet } from "./bullet.js";
import { TowerDrawing } from "./towerDrawing.js";
class Tower {
    context;
    _x;
    _y;
    _w;
    _h;
    _attackPower = 0;
    _listOfUpgrades = [];
    _upgradeCost = 50;
    _cost = 0;
    _enemies = [];
    constructor(context, _x, _y, _w, _h) {
        this.context = context;
        this._x = _x;
        this._y = _y;
        this._w = _w;
        this._h = _h;
    }
    get cost() {
        return this._cost;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get w() {
        return this._w;
    }
    get h() {
        return this._h;
    }
    get upgradeCost() {
        return this._upgradeCost;
    }
    increaseUpgradeCost() {
        this._upgradeCost = 70;
    }
    get listOfUpgrades() {
        return this._listOfUpgrades;
    }
    get enemies() {
        return this._enemies;
    }
    addUpgrade(upgrade) {
        this._listOfUpgrades.push(upgrade);
    }
    updateEnemies(enemies) {
        this._enemies = enemies;
    }
    upgradeAttack() {
        this._attackPower *= 4 / 3;
    }
    get attackPower() {
        return this._attackPower;
    }
    draw() {
        TowerDrawing.drawCharacter1(this.context, this._x, this._y, 0.5);
    }
}
class BulletTower extends Tower {
    _towerSpd = 0;
    _bulletColor = "black";
    _bullets = [];
    _bulletCounter = 0;
    constructor(context, x, y, w, h) {
        super(context, x, y, w, h);
    }
    get bullets() {
        return this._bullets;
    }
    get towerSpd() {
        return this._towerSpd;
    }
    get bulletCounter() {
        return this._bulletCounter;
    }
    upgradeSpeed() {
        this._towerSpd *= 2 / 3;
    }
    get bulletColor() {
        return this._bulletColor;
    }
    inactivateBullets() {
        for (let bullet of this._bullets) {
            bullet.inactivate();
        }
    }
    drawBullets() {
        for (let bullet of this._bullets) {
            bullet.draw();
        }
    }
    resetBulletCounter() {
        this._bulletCounter = 0;
    }
    increaseBulletCounter() {
        this._bulletCounter++;
    }
}
class LinearTower extends BulletTower {
    enemyPath;
    _bullets = [];
    static cost = 85;
    randomBulletColor = false;
    constructor(context, x, y, w, h, enemyPath) {
        super(context, x, y, w, h);
        this.enemyPath = enemyPath;
        this._towerSpd = 400;
        this._attackPower = 0.4;
        this._bulletColor = "#af9b60";
        this._bulletCounter = 0;
    }
    fire() {
        if (this._enemies.length) {
            if (this.randomBulletColor) {
                this._bulletColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
            }
            this._bullets.push(new LinearTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this.bulletColor, this.attackPower, this.enemyPath));
        }
    }
    randomizeBulletColor() {
        this.randomBulletColor = true;
    }
    manageBullet() {
        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                bullet.moveBullet(this._enemies);
            }
        }
        else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }
    }
    draw() {
        TowerDrawing.drawCharacter1(this.context, this._x, this._y, 0.5);
    }
}
class DirectionTower extends BulletTower {
    _directions;
    static cost = 150;
    _bullets = [];
    constructor(context, x, y, w, h, _directions) {
        super(context, x, y, w, h);
        this._directions = _directions;
        this._towerSpd = 1000;
        this._attackPower = 1;
        this._bulletColor = "grey";
    }
    get directions() {
        return this._directions;
    }
    addDirection(direction) {
        this._directions.push(direction);
        console.log(this._directions);
    }
    /**
     * for each direction, create a new bullet aimed at that direction, starting from the center of the tower
     */
    fire() {
        if (this._enemies.length) {
            for (let direction of this._directions) {
                this._bullets.push(new DirectionTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this._bulletColor, this._attackPower, direction));
            }
        }
    }
    manageBullet() {
        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                bullet.launch(this._enemies);
            }
        }
        else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }
    }
    draw() {
        TowerDrawing.drawCharacter2(this.context, this._x, this._y, 0.5);
        for (let direction of this._directions) {
            TowerDrawing.drawCharacter2Aim(this.context, this._x, this._y, direction, 0.5);
        }
    }
}
class LinearRadiusTower extends BulletTower {
    enemyPath;
    _bullets = [];
    _firingRadius = 130;
    static cost = 150;
    _firingMethod = "furthest";
    constructor(context, x, y, w, h, enemyPath) {
        super(context, x, y, w, h);
        this.enemyPath = enemyPath;
        this._towerSpd = 225;
        this._attackPower = 0.8;
        this._bulletColor = "grey";
    }
    get firingRadius() {
        return this._firingRadius;
    }
    get firingMethod() {
        return this._firingMethod;
    }
    upgradeFiringRadius() {
        this._firingRadius *= 4 / 3;
    }
    fire() {
        if (this._enemies.length) {
            this._bullets.push(new LinearRadiusTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this._bulletColor, this._attackPower, this.enemyPath, this._firingRadius));
        }
    }
    setFiringMethod(method) {
        console.log('method changde');
        this._firingMethod = method;
    }
    /**
     * Depending on the firing method, call a different method for the bullet to follow
     */
    manageBullet() {
        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                if (this._firingMethod === "furthest") {
                    bullet.moveBulletToFurthestEnemy(this._enemies);
                }
                else if (this._firingMethod === "closest") {
                    bullet.moveBulletToClosestEnemy(this._enemies);
                }
                else if (this._firingMethod === "strongest") {
                    bullet.moveBulletToStrongestEnemy(this._enemies);
                }
            }
        }
        else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }
    }
    draw() {
        TowerDrawing.drawCharacter4(this.context, this._x, this._y, 0.5);
    }
}
class PathTower extends Tower {
    static cost = 65;
    _hitEnemies = [];
    constructor(context, x, y, w, h) {
        super(context, x, y, w, h);
        this._attackPower = 1;
    }
    hitEnemies() {
        return this._hitEnemies;
    }
    manageBullet() {
        this.dealDamage();
    }
    /**
     * Iterates through all enemies and checks for collisions
     * If there's a collision, damage is given to the enemy
     * Hit enemies are added to an array to ensure damage cannot be given to the same enemy multiple times
     */
    dealDamage() {
        for (let enemy of this._enemies) {
            if (!this._hitEnemies.includes(enemy)) {
                const closestX = Math.max(this._x, Math.min(enemy.x, this._x + this.w));
                const closestY = Math.max(this._y, Math.min(enemy.y, this._y + this.h));
                const dx = enemy.x - closestX;
                const dy = enemy.y - closestY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= enemy.r) {
                    enemy.loseHealth(this._attackPower);
                    this._hitEnemies.push(enemy);
                }
            }
        }
    }
    draw() {
        TowerDrawing.drawCharacter3(this.context, this._x, this._y, 0.5);
    }
}
export { Tower, LinearTower, DirectionTower, PathTower, LinearRadiusTower, BulletTower };
//# sourceMappingURL=tower.js.map