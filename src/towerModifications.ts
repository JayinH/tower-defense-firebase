import { Player } from "./player.js";
import { DirectionTower, LinearRadiusTower, LinearTower, PathTower, Tower } from "./tower.js";

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

class TowerModificationsManager {
    private selectedTower: Tower | null = null;
    private sideMenu = document.querySelector('.side-menu') as HTMLDivElement;
    private selectedTowerIndex: number;
    constructor(
        private player: Player,
        private gameInstance
    ) { }
    /**
     * Adds the passed in upgrade to the database to be read and incorporated in the TowerManager class
     */
    private addOpponentUpgrade(upgrade, direction?: string) {
        const towerUpgradesRef = ref(FirebaseClient.instance.db, `/games/${this.gameInstance}/players/${CanvasManager.instance.player.id}/towerUpgrades`);
        if (direction) {
            push(towerUpgradesRef, ({
                towerIndex: this.selectedTowerIndex,
                upgrade,
                direction,
                confirmedByPlayer: false,
                confirmedByOpponent: false
            }))
                .then(() => { })
                .catch((error) => {
                    throw new Error('Error adding Tower:', error);
                });
        } else {
            push(towerUpgradesRef, ({
                towerIndex: this.selectedTowerIndex,
                upgrade,
                confirmedByPlayer: false,
                confirmedByOpponent: false
            }))
                .then(() => {})
                .catch((error) => {
                    throw new Error('Error adding Tower:', error);
                });
        }
    }

    public setTower(tower: Tower, i: number) {
        this.selectedTower = tower;
        this.selectedTowerIndex = i;
        const currentUpgrades = this.selectedTower.listOfUpgrades;

        if (this.selectedTower instanceof LinearTower) {
            let content = `<span>Current Upgrades: `
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                } else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            } else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            } else {
                content += `None`;
            }
            content += '</span>'
            if (currentUpgrades.length !== 2) {
                if (!currentUpgrades.includes('Random Bullet Color')) {
                    content += ` <button class="randomize-bullet-color upgrade-button mt-2">Randomize Bullet Color - $${this.selectedTower.upgradeCost}</button>`
                }
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>
                <button class="increase-attack upgrade-button mt-2">Increase attack - $${this.selectedTower.upgradeCost}</button>`
                this.sideMenu.innerHTML = content;

                const increaseSpeedBtn = document.querySelector('.increase-speed') as HTMLButtonElement;
                const increaseAttackBtn = document.querySelector('.increase-attack') as HTMLButtonElement;
                const randomizeBulletColorBtn = document.querySelector('.randomize-bullet-color') as HTMLButtonElement;

                if (randomizeBulletColorBtn) {
                    randomizeBulletColorBtn.addEventListener('click', e => {
                        this.addOpponentUpgrade("Random Bullet Color");
                    })
                }

                increaseSpeedBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Speed");
                })

                increaseAttackBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Attack");
                })

            } else {
                content += `<div>This tower has been maxed out</div>`
                this.sideMenu.innerHTML = content;
            }

        }

        if (this.selectedTower instanceof DirectionTower) {
            let content = `<span>Current Upgrades: `
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                } else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            } else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            } else {
                content += `None`;
            }
            content += '</span>'

            if (currentUpgrades.length !== 2) {
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>   `
                if (!this.selectedTower.directions.includes('left')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="left">Add left - $${this.selectedTower.upgradeCost}</button>`
                }
                if (!this.selectedTower.directions.includes('right')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="right">Add right - $${this.selectedTower.upgradeCost}</button>`
                }
                if (!this.selectedTower.directions.includes('up')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="up">Add up - $${this.selectedTower.upgradeCost}</button>`
                }
                if (!this.selectedTower.directions.includes('down')) {
                    content += `<button class="change-direction upgrade-button mt-2" value="down">Add down - $${this.selectedTower.upgradeCost}</button>`
                }

                this.sideMenu.innerHTML = content;
                const increaseSpeedBtn = document.querySelector('.increase-speed') as HTMLButtonElement;
                const changeDirectionBtns = document.querySelectorAll('.change-direction');

                if (changeDirectionBtns) {
                    for (let button of changeDirectionBtns) {
                        const changeDirectionBtn = button as HTMLButtonElement;
                        changeDirectionBtn.addEventListener('click', e => {
                            this.addOpponentUpgrade(`Add ${changeDirectionBtn.value} direction`, changeDirectionBtn.value);
                        })
                    }
                }

                increaseSpeedBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Speed");
                })
            } else {
                content += `<div>This tower has been maxed out</div>`
                this.sideMenu.innerHTML = content;
            }
        }

        if (this.selectedTower instanceof LinearRadiusTower) {
            let content = `<span>Current Upgrades: `
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                } else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            } else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            } else {
                content += `None`;
            }
            content += '</span>';

            if (currentUpgrades.length !== 2) {
                content += ` <button class="increase-speed upgrade-button mt-2">Increase speed - $${this.selectedTower.upgradeCost}</button>
            <button class="increase-firing-radius upgrade-button mt-2">Increase firing radius - $${this.selectedTower.upgradeCost}</button>`
                this.sideMenu.innerHTML = content;
                const increaseSpeedBtn = document.querySelector('.increase-speed') as HTMLButtonElement;
                const increaseFiringRadiusBtn = document.querySelector('.increase-firing-radius') as HTMLButtonElement;

                increaseSpeedBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Speed");
                })

                increaseFiringRadiusBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Firing Radius");
                })

            } else {
                content += `<div>This tower has been maxed out</div>`
                this.sideMenu.innerHTML = content;
            }
        }

        if (this.selectedTower instanceof PathTower) {
            let content = `<span>Current Upgrades: `
            if (currentUpgrades.length === 2) {
                if (currentUpgrades[0] === currentUpgrades[1]) {
                    content += `${currentUpgrades[0]} x2`;
                } else {
                    content += `${currentUpgrades[0]} x1, ${currentUpgrades[1]} x1`;
                }
            } else if (currentUpgrades.length === 1) {
                content += `${currentUpgrades[0]} x1`;
            } else {
                content += `None`;
            }
            content += '</span>'
            if (currentUpgrades.length !== 2) {
                content += `
                <button class="increase-attack upgrade-button mt-2">Increase attack - $${this.selectedTower.upgradeCost}</button>`
                this.sideMenu.innerHTML = content;
                const increaseAttackBtn = document.querySelector('.increase-attack') as HTMLButtonElement;

                increaseAttackBtn.addEventListener('click', e => {
                    this.addOpponentUpgrade("Increase Attack");
                })

            } else {
                content += `<div>This tower has been maxed out</div>`
                this.sideMenu.innerHTML = content;
            }
        }
    }

    public update(): void {
        if (this.selectedTower) {
            if (this.selectedTower instanceof LinearRadiusTower) {
                const allFiringMethodButtons = document.querySelectorAll('.firing-option');
                for (let button of allFiringMethodButtons) {
                    const currentButton = button as HTMLButtonElement;
                    if (currentButton.value === this.selectedTower.firingMethod) {
                        currentButton.disabled = true;
                    } else {
                        currentButton.disabled = false;
                    }
                }
            }
            const allButtons = this.sideMenu.querySelectorAll('.upgrade-button');
            if (this.player.money < this.selectedTower.upgradeCost) {
                for (let button of allButtons) {
                    const currentButton = button as HTMLButtonElement;
                    currentButton.disabled = true;
                }
            } else {
                for (let button of allButtons) {
                    const currentButton = button as HTMLButtonElement;
                    currentButton.disabled = false;
                }
            }
        }
    }

    public defaultMenu() {
        const content = ` <div class="tower-description-heading">Tower Descriptions</div>
        <span>
          <img src="Images/LinearTower.png" class="tower-img" alt="">
          <span class="tower-description">- Linear Tower</span>
        </span>
        <span>
          <img src="Images/DirectionTower.png" class="tower-img" alt="">
          <span class="tower-description">- Direction Tower</span>
        </span>
        <span>
          <img src="Images/PathTower.png" class="tower-img" alt="">
          <span class="tower-description">- Path Tower</span>
        </span>
        <span>
          <img src="Images/RadiusTower.png" class="tower-img" alt="">
          <span class="tower-description">- Radius Tower</span>`
        this.sideMenu.innerHTML = content;
    }
}

export { TowerModificationsManager }