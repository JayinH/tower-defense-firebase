import { Enemy } from "./enemy.js";
import { PathBlock } from "./pathclass.js";
import { Player } from "./player.js";
import { BulletTower, DirectionTower, LinearRadiusTower, LinearTower, PathTower, Tower } from "./tower.js";

import {
    set,
    onDisconnect,
    onValue,
    push,
    remove,
    update,
    onChildAdded,
    onChildRemoved,
    ref,
    //@ts-ignore Import module
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
import { CanvasManager } from "./canvasmanager.js";

interface TowerManagerInfo {
    towers: Tower[],
    bulletTowers: BulletTower[],
    enemyPath: PathBlock[]
}

interface TowerManagerCreateTowers {
    createLinearTower(player: Player, xSquare: number, ySquare: number): void,
    createLinearRadiusTower(player: Player, xSquare: number, ySquare: number): void,
    createDirectionTower(player: Player, xSquare: number, ySquare: number, direction: string): void,
    createPathTower(player: Player, xSquare: number, ySquare: number): void
}

interface TowerManagerEnemies {
    setEnemyPath(path: PathBlock[]): void,
    updateEnemies(enemies: Enemy[]): void,
    drawPathTowers(): void,
    drawBulletTowers(): void,
}

interface TowerMangaerBullets {
    fire(index: number): void,
    manageBullets(): void,
    inactivateBullets(): void,
    drawBullets(): void
}

class TowerManager implements TowerManagerInfo, TowerManagerCreateTowers, TowerManagerEnemies, TowerMangaerBullets {
    private _towers: Tower[] = [];
    private _bulletTowers: BulletTower[] = [];
    private _enemyPath: PathBlock[] = []
    constructor(
        private context: CanvasRenderingContext2D,
        private mainOrOpponent ?: string
    ) {}
    public get bulletTowers(): BulletTower[] {
        return this._bulletTowers;
    }

    public get towers(): Tower[] {
        return this._towers;
    }

    public get enemyPath(): PathBlock[] {
        return this._enemyPath;
    }

    public fire(index: number): void {
        this._bulletTowers[index].fire();
    }

    public setEnemyPath(path: PathBlock[]): void {
        this._enemyPath = path;
    }

    /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new linear tower is created and added to the tower and bullet tower array.
     */
    public createLinearTower(player: Player, xSquare: number, ySquare: number): void {
        if(player.money >= LinearTower.cost) {
            // const tower = new LinearTower(this.context,(xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, this._enemyPath)
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // if(this.mainOrOpponent !== "opponent") {
                this.addOpponentTower("Linear", xSquare, ySquare);
            // }
            
            // player.spendMoney(LinearTower.cost);
        } else {
            throw new Error("Can't Afford");
        }
    }

    private addOpponentTower(type: string, xSquare: number, ySquare: number, direction ?: string) {
        const towersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers`);
        // console.log(CanvasManager.instance.player.id)
        // console.log(CanvasManager.instance.opponentId)
        // Use push to add the enemy value to the array-like structure
      if(direction) {
        push(towersRef, ({
            type,
            xSquare,
            ySquare,
            direction,
            confirmedByPlayer: false,
            confirmedByOpponent: false
        }))
        .then(() => {
            console.log('Tower added successfully');
        })
        .catch((error) => {
            console.error('Error adding Tower:', error);
        });
      } else {
        push(towersRef, ({
            type,
            xSquare,
            ySquare,
            confirmedByPlayer: false,
            confirmedByOpponent: false
        }))
        .then(() => {
            console.log('Tower added successfully');
        })
        .catch((error) => {
            console.error('Error adding Tower:', error);
        });
      }
    }

     /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new linear radius tower is created and added to the tower and bullet tower array.
     */
    public createLinearRadiusTower(player: Player, xSquare: number, ySquare: number): void {
        if(player.money >= LinearTower.cost) {
            // const tower = new LinearRadiusTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, this._enemyPath)
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // player.spendMoney(LinearRadiusTower.cost);
            // if(this.mainOrOpponent !== "opponent") {
                this.addOpponentTower("Linear Radius", xSquare, ySquare);
            // }
        } else {
            throw new Error("Can't Afford");
        }
    }

     /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new direction tower is created and added to the tower and bullet tower array.
     */
    public createDirectionTower(player: Player, xSquare: number, ySquare: number, direction: string): void {
        if(player.money >= DirectionTower.cost) {
            // const tower = new DirectionTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, [direction])
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // if(this.mainOrOpponent !== "opponent") {
                this.addOpponentTower("Direction", xSquare, ySquare, direction);
            // }
            // player.spendMoney(DirectionTower.cost);
        } else {
            throw new Error("Can't Afford");
        }
    }

     /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new path tower is created and added to the tower array.
     */
    public createPathTower(player: Player, xSquare: number, ySquare: number): void {
        if(player.money >= PathTower.cost) {
            // this._towers.push(new PathTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50));
            // player.spendMoney(PathTower.cost);
            // if(this.mainOrOpponent !== "opponent") {
                this.addOpponentTower("Path", xSquare, ySquare);
            // }
        } else {
            throw new Error("Can't Afford");
        }
    }

    public manageBullets(): void {
        for (let tower of this._towers) {
            tower.manageBullet();

        }
    }

    public updateEnemies(enemies: Enemy[]): void {
        for (let tower of this._towers) {
            tower.updateEnemies(enemies);
        }
    }

    public inactivateBullets(): void {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower) {
                tower.inactivateBullets();
            }
        }
    }

    public drawBullets(): void {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower) {
               tower.drawBullets();
            }
        }
    }

    public drawPathTowers(): void {
        for (let tower of this._towers) {
            if (tower instanceof PathTower)
                tower.draw();
        }
    }

    public drawBulletTowers(): void {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower)
                tower.draw();
        }
    }
}

export {TowerManager}