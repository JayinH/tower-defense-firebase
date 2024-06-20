import { Bullet, DirectionTowerBullet, LinearRadiusTowerBullet, LinearTowerBullet } from "./bullet.js";
import { CanvasManager } from "./canvasmanager.js";
import { Enemy } from "./enemy.js";
import { PathBlock } from "./pathclass.js";
import { TowerDrawing } from "./towerDrawing.js";

interface TowerInformation {
    attackPower: number,
    listOfUpgrades: string[],
    upgradeCost: number,
    enemies: Enemy[],
    cost: number
    addUpgrade(upgrade: string): void,
    updateEnemies(enemies: Enemy[]): void,
    upgradeAttack(): void,
    draw(): void,
    manageBullet(): void
}

interface TowerLocationInfo {
    x: number,
    y: number,
    w: number,
    h: number
}

abstract class Tower implements TowerInformation, TowerLocationInfo {
    protected _attackPower: number = 0;
    protected _listOfUpgrades: string [] = [];
    protected _upgradeCost: number = 50;
    protected _cost: number = 0;
    protected _enemies: Enemy[] = [];
    constructor(
        protected context: CanvasRenderingContext2D,
        protected _x: number,
        protected _y: number,
        protected _w: number,
        protected _h: number,
    ) {

    }

    public get cost(): number {
        return this._cost;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get w(): number {
        return this._w;
    }

    public get h(): number {
        return this._h;
    }


    public get upgradeCost(): number {
        return this._upgradeCost;
    }

    public increaseUpgradeCost(): void {
        this._upgradeCost = 70;
    }

    public get listOfUpgrades(): string[] {
        return this._listOfUpgrades;
    }

    public get enemies(): Enemy[] {
        return this._enemies;
    }

    public addUpgrade(upgrade: string): void {
        this._listOfUpgrades.push(upgrade);
    }

    public updateEnemies(enemies: Enemy[]): void {
        this._enemies = enemies;
    }

    public upgradeAttack() {
        this._attackPower *= 4/3
    }

    public get attackPower(): number {
        return this._attackPower;
    }


    public draw(): void {
        TowerDrawing.drawCharacter1(this.context, this._x, this._y, 0.5);
    }

    abstract manageBullet(): void;
}

interface BulletTowerInformation {
    towerSpd: number,
    bulletColor: string,
    bullets: Bullet[],
    bulletCounter: number,
    fire(): void
}

abstract class BulletTower extends Tower implements BulletTowerInformation{
    protected _towerSpd: number = 0;
    protected _bulletColor: string = "black";
    protected _bullets: Bullet[] = [];
    protected _bulletCounter: number = 0;
    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        super(context, x, y, w, h);
    }

    public get bullets(): Bullet[] {
        return this._bullets;
    }

    public get towerSpd(): number {
        return this._towerSpd;
    }

    public get bulletCounter(): number {
        return this._bulletCounter;
    }

    public upgradeSpeed() {
        this._towerSpd *= 2/3;
    }

    public get bulletColor(): string {
        return this._bulletColor;
    }

    public inactivateBullets(): void {
        for (let bullet of this._bullets) {
            bullet.inactivate();
        }
    }

    public drawBullets(): void {
        for (let bullet of this._bullets) {
            bullet.draw();
        }
    }

    public resetBulletCounter(): void {
        this._bulletCounter = 0;
    }

    public increaseBulletCounter(): void {
        this._bulletCounter++;
    }

    abstract fire(): void

     /**
     * If there are still enemies, filter out all the inactive bullets
     * Move all the active bullets towards the enemy
     * If there are no more enemies, inactivate the bullets
     */
    abstract manageBullet(): void
}

class LinearTower extends BulletTower {
    protected _bullets: LinearTowerBullet[] = [];
    static readonly cost: number = 85;
    private randomBulletColor: boolean = false;
    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        protected enemyPath: PathBlock[]
    ) {
        super(context, x, y, w, h)
        this._towerSpd = 400;
        this._attackPower = 0.4;
        this._bulletColor = "#af9b60";
        this._bulletCounter = 0;
    }

    public fire() {
        if (this._enemies.length) {
            if(this.randomBulletColor) {
                this._bulletColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
            }
            this._bullets.push(new LinearTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this.bulletColor, this.attackPower, this.enemyPath))

        }
    }

   public randomizeBulletColor(): void {
    this.randomBulletColor = true;
   }

    public manageBullet() {
        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                bullet.moveBullet(this._enemies);
            }
        } else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }

    }

    public draw(): void {
        TowerDrawing.drawCharacter1(this.context, this._x, this._y, 0.5);
    }
}

interface DirectionTowerInfo {
    directions: string[]
}

class DirectionTower extends BulletTower implements DirectionTowerInfo{
    static readonly cost: number = 150;
    protected _bullets: DirectionTowerBullet[] = [];
    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        private _directions: string []
    ) {
        super(context, x, y, w, h)
        this._towerSpd = 1000;
        this._attackPower = 1;
        this._bulletColor = "grey";
    }

    public get directions(): string[] {
        return this._directions;
    }

    public addDirection(direction: string): void {
        this._directions.push(direction);
    }

    /**
     * for each direction, create a new bullet aimed at that direction, starting from the center of the tower
     */

    public fire() {
        if (this._enemies.length) {
            for(let direction of this._directions) {
                this._bullets.push(new DirectionTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this._bulletColor, this._attackPower, direction));
            }
        }
    }

    public manageBullet() {
        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                bullet.launch(this._enemies);
            }
        } else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }
    }

    public draw(): void {
        TowerDrawing.drawCharacter2(this.context, this._x, this._y, 0.5);
        for(let direction of this._directions) {
            TowerDrawing.drawCharacter2Aim(this.context, this._x, this._y, direction, 0.5);
        }
    }
}

interface LinearRadiusTowerInfo {
    firingRadius: number,
    firingMethod: string,
}

class LinearRadiusTower extends BulletTower implements LinearRadiusTowerInfo {
    protected _bullets: LinearRadiusTowerBullet[] = [];
    protected _firingRadius: number = 130;
    static readonly cost: number = 150;
    protected _firingMethod = "furthest";

    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        private enemyPath: PathBlock[]
    ) {
        super(context, x, y, w, h)
        this._towerSpd = 225;
        this._attackPower = 0.8;
        this._bulletColor = "grey";
    }

    public get firingRadius(): number {
        return this._firingRadius;
    }

    public get firingMethod(): string {
        return this._firingMethod;
    }

    public upgradeFiringRadius(): void {
        this._firingRadius *= 4/3;
    }

    public fire() {
        if (this._enemies.length) {
            this._bullets.push(new LinearRadiusTowerBullet(this.context, this._x + this.w / 2, this._y + this.h / 2, 5, this._bulletColor, this._attackPower, this.enemyPath, this._firingRadius))

        }
    }

    public setFiringMethod(method: string): void {
        this._firingMethod = method;
    }

    /**
     * Depending on the firing method, call a different method for the bullet to follow
     */
    public manageBullet() {

        if (this._enemies.length) {
            this._bullets = this._bullets.filter(bullet => bullet.active);
            for (let bullet of this._bullets) {
                if(this._firingMethod === "furthest") {
                    bullet.moveBulletToFurthestEnemy(this._enemies);
                } else if(this._firingMethod === "closest") {
                    bullet.moveBulletToClosestEnemy(this._enemies);
                } else if(this._firingMethod === "strongest") {
                    bullet.moveBulletToStrongestEnemy(this._enemies);
                } 
            }
        } else {
            for (let bullet of this._bullets) {
                bullet.inactivate();
            }
        }
    }

    public draw(): void {
        TowerDrawing.drawCharacter4(this.context, this._x, this._y, 0.5);
    }
}

interface PathTowerInfo {
    hitEnemies: Enemy[],
    dealDamage(): void
}

class PathTower extends Tower implements PathTower {
    static readonly cost: number = 65;
    private _hitEnemies: Enemy[] = []

    constructor(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
    ) {
        super(context, x, y, w, h)
        this._attackPower = 1;
    }

    public hitEnemies(): Enemy[] {
        return this._hitEnemies;
    }

    public manageBullet() {
        this.dealDamage();
    }
    /**
     * Iterates through all enemies and checks for collisions
     * If there's a collision, damage is given to the enemy
     * Hit enemies are added to an array to ensure damage cannot be given to the same enemy multiple times
     */
    public dealDamage(): void {
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

    public draw(): void {
        TowerDrawing.drawCharacter3(this.context, this._x, this._y, 0.5);
    }
}

export {Tower, LinearTower, DirectionTower, PathTower, LinearRadiusTower, BulletTower}