import { Enemy } from "./enemy.js";
import { PathBlock } from "./pathclass.js";
import { Player } from "./player.js";
import { BulletTower, DirectionTower, LinearRadiusTower, LinearTower, PathTower, Tower } from "./tower.js";

import {
push,
remove,
update,
onChildAdded,
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
        private gameInstance: string,
        private mainOrOpponent?: string
    ) { }
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

    private newTowerUnsubscribe: (() => void) | null = null;
    private towerUpgradeUnsubscribe: (() => void) | null = null;

    private stopListeningForNewTower() {
        if (this.newTowerUnsubscribe) {
            this.newTowerUnsubscribe();
            this.newTowerUnsubscribe = null;
        }
    }

    private stopListeningForTowerUpgrades() {
        if (this.towerUpgradeUnsubscribe) {
            this.towerUpgradeUnsubscribe();
            this.towerUpgradeUnsubscribe = null;
        }
    }

    public destroy() {
        this.stopListeningForNewTower();
        this.stopListeningForTowerUpgrades();
    }

    /**
     * 
     * @param type - type of tower
     * The tower will be added to he database containing its information to be created
     * This is done to first send the tower to the database before creating it so that the
     * tower created on the main screen and the tower created on the split screen both need to acess
     * the database, reducing the latency.
     */
    private addTowerToDatabase(type: string, xSquare: number, ySquare: number, direction?: string) {
        const towersRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towers`);
        if (direction) {
            push(towersRef, ({
                type,
                xSquare,
                ySquare,
                direction,
                confirmedByPlayer: false,
                confirmedByOpponent: false
            }))
                .then(() => {})
                .catch((error) => {
                    throw new Error('Error adding Tower:', error);
                });
        } else {
            push(towersRef, ({
                type,
                xSquare,
                ySquare,
                confirmedByPlayer: false,
                confirmedByOpponent: false
            }))
                .then(() => {})
                .catch((error) => {
                    throw new Error('Error adding Tower:', error);
                });
        }
    }

/**
 * 
 * @param player - player purchasing the tower
 * Remove any existing event listeners handling the tower creation
 * Once a new tower has been detected, the player will spend money and the tower will be built
 * Once both the player and split screen player have bulit the tower, it can be removed from the database
 */

    public listenForNewTowerMain(player: Player) {
        if (this.newTowerUnsubscribe) {
            this.newTowerUnsubscribe();
        }
        const towerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towers`);
        this.newTowerUnsubscribe = onChildAdded(towerRef, (snapshot) => {
            const tower = snapshot.val();
            const towerKey = snapshot.key;
            if (tower && !tower.confirmedByPlayer) {
                if (tower.type === "Linear") {
                    const newTower = new LinearTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.enemyPath);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(LinearTower.cost);
                } else if (tower.type === "Direction") {
                    const newTower = new DirectionTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, [tower.direction]);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(DirectionTower.cost);
                } else if (tower.type === "Linear Radius") {
                    const newTower = new LinearRadiusTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.enemyPath);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(LinearRadiusTower.cost);
                } else if (tower.type === "Path") {
                    const newTower = new PathTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50);
                    this.towers.push(newTower);
                    player.spendMoney(PathTower.cost);
                }
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towers/${towerKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    if (tower.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towers/${towerKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming tower end:', error);
                });
            }
        }, { onlyOnce: false });
    }

    /**
     * Does the same thing as the code above but confirms for the opponent side and checks for the main
     */
    public listenForNewTowerOpponent(player: Player) {
        const towerRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towers`);
        onChildAdded(towerRef, (snapshot) => {
            const tower = snapshot.val();
            const towerKey = snapshot.key;
            if (tower && !tower.confirmedByPlayer) {
                if (tower.type === "Linear") {
                    const newTower = new LinearTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.enemyPath);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(LinearTower.cost);
                } else if (tower.type === "Direction") {
                    const newTower = new DirectionTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, [tower.direction]);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(DirectionTower.cost);
                } else if (tower.type === "Linear Radius") {
                    const newTower = new LinearRadiusTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50, this.enemyPath);
                    this.towers.push(newTower);
                    this.bulletTowers.push(newTower);
                    player.spendMoney(LinearRadiusTower.cost);
                } else if (tower.type === "Path") {
                    const newTower = new PathTower(this.context, (tower.xSquare - 1) * 50, (tower.ySquare - 1) * 50, 50, 50);
                    this.towers.push(newTower);
                    player.spendMoney(PathTower.cost);
                }
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towers/${towerKey}`), {
                    confirmedByOpponent: true
                }).then(() => {
                    if (tower.confirmedByPlayer) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towers/${towerKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming tower end:', error);
                });
            }
        });

    }

    /**
     * 
     * @param player - player upgrading the tower
     * Any existing listeners are removed
     * The tower is upgraded, and the same logic is executed as seen in the creation of a new tower
     */

    public listenForTowerUpgradesMain(player: Player) {
        if (this.towerUpgradeUnsubscribe) {
            this.towerUpgradeUnsubscribe();
        }

        const towersRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades`);
        this.towerUpgradeUnsubscribe = onChildAdded(towersRef, (snapshot) => {
            const towerUpgrade = snapshot.val();
            const towerKey = snapshot.key;
            if (towerUpgrade) {
                const selectedTower = this.towers[towerUpgrade.towerIndex]
                player.spendMoney(selectedTower.upgradeCost)
                selectedTower.increaseUpgradeCost();
                if (towerUpgrade.upgrade === "Increase Speed") {
                    selectedTower.addUpgrade("Increase Speed");
                    if (selectedTower instanceof BulletTower) selectedTower.upgradeSpeed();
                } else if (towerUpgrade.upgrade === "Random Bullet Color") {
                    selectedTower.addUpgrade("Random Bullet Color");
                    if (selectedTower instanceof LinearTower) selectedTower.randomizeBulletColor();
                } else if (towerUpgrade.upgrade === "Increase Attack") {
                    selectedTower.addUpgrade("Increase Attack");
                    if (selectedTower instanceof LinearTower || selectedTower instanceof PathTower) selectedTower.upgradeAttack();
                } else if (towerUpgrade.upgrade === "Increase Firing Radius") {
                    selectedTower.addUpgrade("Increase Firing Radius");
                    if (selectedTower instanceof LinearRadiusTower) selectedTower.upgradeFiringRadius();
                } else if (towerUpgrade.direction) {
                    selectedTower.addUpgrade(towerUpgrade.upgrade);
                    if (selectedTower instanceof DirectionTower) selectedTower.addDirection(towerUpgrade.direction);
                }
               
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades/${towerKey}`), {
                    confirmedByPlayer: true
                }).then(() => {
                    if (towerUpgrade.confirmedByOpponent) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades/${towerKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming tower upgrade:', error);
                });
            }
        }, { onlyOnce: false });
    }

    /**
     * Does the same thing as the code above but confirms for the opponent side and checks for the main
     */
    public listenForTowerUpgradesOpponent(player: Player) {
        if (this.towerUpgradeUnsubscribe) {
            this.towerUpgradeUnsubscribe();
        }

        const towersRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towerUpgrades`);
        this.towerUpgradeUnsubscribe = onChildAdded(towersRef, (snapshot) => {
            const towerUpgrade = snapshot.val();
            const towerKey = snapshot.key;
            if (towerUpgrade) {
                const selectedTower = this.towers[towerUpgrade.towerIndex]
                player.spendMoney(selectedTower.upgradeCost)
                selectedTower.increaseUpgradeCost();
                if (towerUpgrade.upgrade === "Increase Speed") {
                    selectedTower.addUpgrade("Increase Speed");
                    if (selectedTower instanceof BulletTower) selectedTower.upgradeSpeed();
                } else if (towerUpgrade.upgrade === "Random Bullet Color") {
                    selectedTower.addUpgrade("Random Bullet Color");
                    if (selectedTower instanceof LinearTower) selectedTower.randomizeBulletColor();
                } else if (towerUpgrade.upgrade === "Increase Attack") {
                    selectedTower.addUpgrade("Increase Attack");
                    if (selectedTower instanceof LinearTower || selectedTower instanceof PathTower) selectedTower.upgradeAttack();
                } else if (towerUpgrade.upgrade === "Increase Firing Radius") {
                    selectedTower.addUpgrade("Increase Firing Radius");
                    if (selectedTower instanceof LinearRadiusTower) selectedTower.upgradeFiringRadius();
                } else if (towerUpgrade.direction) {
                    selectedTower.addUpgrade(towerUpgrade.upgrade);
                    if (selectedTower instanceof DirectionTower) selectedTower.addDirection(towerUpgrade.direction);
                }
               
                update(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towerUpgrades/${towerKey}`), {
                    confirmedByOpponent: true
                }).then(() => {
                    if (towerUpgrade.confirmedByPlayer) {
                        remove(ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.opponentId}/towerUpgrades/${towerKey}`)).then(() => {
                        }).catch((error) => {
                            throw new Error('Error removing tower:', error);
                        });
                    }
                }).catch((error) => {
                    throw new Error('Error confirming tower upgrade:', error);
                });
            }
        }, { onlyOnce: false });
    }

    /**
     * @param xSquare - x square where the tower is being places
     * @param ySquare  - y square where the tower is being places tower
     * Checks if the player has enough money to afford the tower
     * If so, the new linear tower is is added to the databse
     */
    public createLinearTower(player: Player, xSquare: number, ySquare: number): void {
        if (player.money >= LinearTower.cost) {
            this.addTowerToDatabase("Linear", xSquare, ySquare);
        } else {
            throw new Error("Can't Afford");
        }
    }

    /**
    * @param xSquare - x square where the tower is being places
    * @param ySquare  - y square where the tower is being places tower
    * Checks if the player has enough money to afford the tower
    * If so, the new linear radius tower is is added to the databse
    */
    public createLinearRadiusTower(player: Player, xSquare: number, ySquare: number): void {
        if (player.money >= LinearTower.cost) {
            this.addTowerToDatabase("Linear Radius", xSquare, ySquare);
        } else {
            throw new Error("Can't Afford");
        }
    }

    /**
    * @param xSquare - x square where the tower is being places
    * @param ySquare  - y square where the tower is being places tower
    * Checks if the player has enough money to afford the tower
    * If so, the new direction tower is added to the databse
    */
    public createDirectionTower(player: Player, xSquare: number, ySquare: number, direction: string): void {
        if (player.money >= DirectionTower.cost) {
            this.addTowerToDatabase("Direction", xSquare, ySquare, direction);
        } else {
            throw new Error("Can't Afford");
        }
    }

    /**
    * @param xSquare - x square where the tower is being places
    * @param ySquare  - y square where the tower is being places tower
    * Checks if the player has enough money to afford the tower
    * If so, the new path tower is is added to the databse
    */
    public createPathTower(player: Player, xSquare: number, ySquare: number): void {
        if (player.money >= PathTower.cost) {
            this.addTowerToDatabase("Path", xSquare, ySquare);
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

export { TowerManager }
