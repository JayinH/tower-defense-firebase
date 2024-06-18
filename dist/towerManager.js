import { BulletTower, DirectionTower, LinearTower, PathTower } from "./tower.js";
import { push, ref,
//@ts-ignore Import module
 } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FirebaseClient } from "./firebaseApp.js";
import { CanvasManager } from "./canvasmanager.js";
class TowerManager {
    context;
    mainOrOpponent;
    _towers = [];
    _bulletTowers = [];
    _enemyPath = [];
    constructor(context, mainOrOpponent) {
        this.context = context;
        this.mainOrOpponent = mainOrOpponent;
    }
    get bulletTowers() {
        return this._bulletTowers;
    }
    get towers() {
        return this._towers;
    }
    get enemyPath() {
        return this._enemyPath;
    }
    fire(index) {
        this._bulletTowers[index].fire();
    }
    setEnemyPath(path) {
        this._enemyPath = path;
    }
    /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new linear tower is created and added to the tower and bullet tower array.
     */
    createLinearTower(player, xSquare, ySquare) {
        if (player.money >= LinearTower.cost) {
            // const tower = new LinearTower(this.context,(xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, this._enemyPath)
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // if(this.mainOrOpponent !== "opponent") {
            this.addOpponentTower("Linear", xSquare, ySquare);
            // }
            // player.spendMoney(LinearTower.cost);
        }
        else {
            throw new Error("Can't Afford");
        }
    }
    addOpponentTower(type, xSquare, ySquare, direction) {
        const towersRef = ref(FirebaseClient.instance.db, `/games/${CanvasManager.instance.connectionInstance}/players/${CanvasManager.instance.player.id}/towers`);
        // console.log(CanvasManager.instance.player.id)
        // console.log(CanvasManager.instance.opponentId)
        // Use push to add the enemy value to the array-like structure
        if (direction) {
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
        }
        else {
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
    createLinearRadiusTower(player, xSquare, ySquare) {
        if (player.money >= LinearTower.cost) {
            // const tower = new LinearRadiusTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, this._enemyPath)
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // player.spendMoney(LinearRadiusTower.cost);
            // if(this.mainOrOpponent !== "opponent") {
            this.addOpponentTower("Linear Radius", xSquare, ySquare);
            // }
        }
        else {
            throw new Error("Can't Afford");
        }
    }
    /**
    * @param xSquare - x square where the tower is being places
    * @param ySquare  - y square where the tower is being places tower
    * Checks if the player has enough money to afford the tower
    * If so, the new direction tower is created and added to the tower and bullet tower array.
    */
    createDirectionTower(player, xSquare, ySquare, direction) {
        if (player.money >= DirectionTower.cost) {
            // const tower = new DirectionTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50, [direction])
            // this._towers.push(tower);
            // this._bulletTowers.push(tower);
            // if(this.mainOrOpponent !== "opponent") {
            this.addOpponentTower("Direction", xSquare, ySquare, direction);
            // }
            // player.spendMoney(DirectionTower.cost);
        }
        else {
            throw new Error("Can't Afford");
        }
    }
    /**
    * @param xSquare - x square where the tower is being places
    * @param ySquare  - y square where the tower is being places tower
    * Checks if the player has enough money to afford the tower
    * If so, the new path tower is created and added to the tower array.
    */
    createPathTower(player, xSquare, ySquare) {
        if (player.money >= PathTower.cost) {
            // this._towers.push(new PathTower(this.context, (xSquare - 1) * 50, (ySquare - 1) * 50, 50, 50));
            // player.spendMoney(PathTower.cost);
            // if(this.mainOrOpponent !== "opponent") {
            this.addOpponentTower("Path", xSquare, ySquare);
            // }
        }
        else {
            throw new Error("Can't Afford");
        }
    }
    manageBullets() {
        for (let tower of this._towers) {
            tower.manageBullet();
        }
    }
    updateEnemies(enemies) {
        for (let tower of this._towers) {
            tower.updateEnemies(enemies);
        }
    }
    inactivateBullets() {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower) {
                tower.inactivateBullets();
            }
        }
    }
    drawBullets() {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower) {
                tower.drawBullets();
            }
        }
    }
    drawPathTowers() {
        for (let tower of this._towers) {
            if (tower instanceof PathTower)
                tower.draw();
        }
    }
    drawBulletTowers() {
        for (let tower of this._towers) {
            if (tower instanceof BulletTower)
                tower.draw();
        }
    }
}
export { TowerManager };
//# sourceMappingURL=towerManager.js.map