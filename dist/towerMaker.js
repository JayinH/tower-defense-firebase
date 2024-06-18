"use strict";
class TowerMaker {
    static _instance;
    towers = [];
    bulletTowers = [];
    bulletInterval = [];
    bulletCounter = [];
    constructor() {
    }
    static get instance() {
        if (!TowerMaker._instance) {
            TowerMaker._instance = new TowerMaker();
        }
        return TowerMaker._instance;
    }
    addBulletInterval(time) {
        this.bulletInterval.push(time);
    }
    createLinearTower(xSqaure, ySquare, speed, attackPower, bulletColor) {
        this.towers.push(new LinearTower((xSqaure - 1) * 50, (ySquare - 1) * 50, 50, 50, speed, attackPower, bulletColor));
        this.bulletTowers.push(this.towers[this.towers.length - 1]);
        this.addBulletInterval(speed);
        this.bulletCounter.push(0);
    }
    createDirectionTower(xSqaure, ySquare, speed, attackPower, bulletColor, direction) {
        this.towers.push(new DirectionTower((xSqaure - 1) * 50, (ySquare - 1) * 50, 50, 50, speed, attackPower, bulletColor, direction));
        this.bulletTowers.push(this.towers[this.towers.length - 1]);
        this.addBulletInterval(speed);
        this.bulletCounter.push(0);
    }
    createPathTower(xSqaure, ySquare, attackDmg) {
        this.towers.push(new PathTower((xSqaure - 1) * 50, (ySquare - 1) * 50, 50, 50, attackDmg));
    }
    manageBullets() {
        for (let tower of this.towers) {
            tower.manageBullet();
        }
    }
    updateEnemies(enemies) {
        for (let tower of this.towers) {
            tower.updateEnemies(enemies);
        }
    }
    updateBullets() {
        for (let tower of this.towers) {
            if (tower instanceof BulletTower) {
                for (let bullet of tower.bullets) {
                    bullet.inactivate();
                }
            }
        }
    }
    drawBullets() {
        for (let tower of this.towers) {
            if (tower instanceof BulletTower) {
                for (let bullet of tower.bullets) {
                    bullet.draw();
                }
            }
        }
    }
    drawPathTowers() {
        for (let tower of this.towers) {
            if (tower instanceof PathTower)
                tower.draw();
        }
    }
    drawBulletTowers() {
        for (let tower of this.towers) {
            if (tower instanceof BulletTower)
                tower.draw();
        }
    }
}
//# sourceMappingURL=towerMaker.js.map